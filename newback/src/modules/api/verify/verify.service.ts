import {VerificationType} from '@common/model/enum/verification.type';
import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";
import {UserRepository} from "@/modules/shared/database/repository/user.repository";
import {PasswordService} from "@/modules/shared/password/password.service";
import {EmailService} from "@/modules/shared/email/email.service";
import {Sequelize} from "sequelize-typescript";
import type {VerificationModel} from "@/data/model/verification.model";
import {IpCacheService} from "@/modules/shared/ip/ip.cache.service";
import {VerificationRepository} from "@/modules/shared/database/repository/verification.repository";
import {SessionService} from "@/modules/shared/session/session.service";


@Injectable()
export class VerifyService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly ipCacheService: IpCacheService,
    private readonly sequelize: Sequelize,
    private readonly logger: Logger,
    private readonly sessionService: SessionService,
  ) {
  }

  public async verifyToken(token: string): Promise<VerifyTokenResponse> {
    const verificationModel: VerificationModel = await this.verificationRepository.getVerification(token);
    // https://pychat.org/#/auth/proceed-reset-password?token=evhv0zum3l8gavzql4xk5u16q2h9gqd2
    this.doTokenVerification(verificationModel, VerificationType.PASSWORD);
    return {
      ok: true,
      username: verificationModel.user.username,
    };
  }

  public async sendRestorePassword(body: SendRestorePasswordRequest, ip: string): Promise<void> {
    return this.sequelize.transaction(async(t) => {
      let email, userId, username;
      if (body.email) {
        const user = await this.userRepository.getUserByEmail(body.email, t);
        if (!user) {
          throw new BadRequestException("User with this email doesnt exit");
        }
        username = user.user.username;
        userId = user.id;
        email = body.email;
      } else if (body.username) {
        const user = await this.userRepository.getUserByUserName(body.username, ["userAuth"], t);
        if (!user) {
          throw new BadRequestException("User with this username doesnt exit");
        }
        if (!user.userAuth.email) {
          throw new BadRequestException("This user didnt specify an email");
        }
        email = user.userAuth.email;
        username = user.username;
        userId = user.id;
      }
      const token: string = await this.passwordService.generateRandomString(32);
      this.logger.log(`Generated token='${token}' to restore user email='${email}'`);
      await this.verificationRepository.createVerification({
        email,
        userId,
        token,
        verified: false,
        type: VerificationType.PASSWORD,
      }, t);
      const ipInfo = await this.ipCacheService.getIpString(ip);
      await this.emailService.sendRestorePasswordEmail(username, userId, email, token, ip, ipInfo);
    });
  }

  public async acceptToken(body: AcceptTokenRequest): Promise<AcceptTokenResponse> {
    return this.sequelize.transaction(async(t) => {
      const verificationModel: VerificationModel = await this.verificationRepository.getVerification(body.token, t);
      this.doTokenVerification(verificationModel, VerificationType.PASSWORD);
      const password = await this.passwordService.createPassword(body.password);
      this.logger.log(`Generated newPassword='${password}' for verification='${verificationModel.id}' for userId=${verificationModel.userId}`, "verify.service");
      await this.userRepository.updateUserPassword(verificationModel.userId, password, t);
      await this.verificationRepository.markVerificationVerified(verificationModel.id, t);
      const session = await this.sessionService.createAndSaveSession(verificationModel.userId);
      const result: AcceptTokenResponse = {
        session,
      };
      return result;
    });
  }

  public async confirmEmail(body: ConfirmEmailRequest): Promise<void> {
    await this.sequelize.transaction(async(t) => {
      const verificationModel: VerificationModel = await this.verificationRepository.getVerification(body.token, t);
      this.doTokenVerification(verificationModel, VerificationType.REGISTER);
      await this.verificationRepository.markVerificationVerified(verificationModel.id, t);
      await this.verificationRepository.setUserVerification(verificationModel.userId, verificationModel.id, t);
    });
  }

  private doTokenVerification(data: VerificationModel, typ: VerificationType): void {
    if (!data) {
      throw new BadRequestException("Invalid token");
    }
    if (data.type != typ) {
      throw new BadRequestException("Invalid operation");
    }
    if (data.verified) {
      throw new BadRequestException("This token is already used");
    }
    if (Date.now() - data.createdAt.getTime() > 24 * 3600 * 1000) { // 24 hours
      throw new BadRequestException("This token is already expired");
    }
  }
}
