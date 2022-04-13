import {
  BadRequestException,
  Injectable,
  Logger
} from '@nestjs/common';
import {UserRepository} from '@/modules/rest/database/repository/user.repository';
import {PasswordService} from '@/modules/rest/password/password.service';
import {
  AcceptTokenRequest,
  AcceptTokenResponse,
  ConfirmEmailRequest,
  SendRestorePasswordRequest,
  VerificationType,
  VerifyTokenResponse
} from '@/data/types/frontend';
import {EmailService} from '@/modules/rest/email/email.service';
import {Sequelize} from 'sequelize-typescript';
import {VerificationModel} from '@/data/model/verification.model';
import {IpCacheService} from '@/modules/rest/ip/ip.cache.service';
import {VerificationRepository} from '@/modules/rest/database/repository/verification.repository';
import {SessionService} from '@/modules/rest/session/session.service';

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

  public async verifyToken(token: string): Promise<VerifyTokenResponse> {
    let verificationModel: VerificationModel = await this.verificationRepository.getVerification(token);
    //https://pychat.org/#/auth/proceed-reset-password?token=evhv0zum3l8gavzql4xk5u16q2h9gqd2
    this.doTokenVerification(verificationModel, VerificationType.PASSWORD)
    return {
      ok: true,
      username: verificationModel.user.username
    }
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
        const user = await this.userRepository.getUserByUserName(body.username, ['userAuth'], t);
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
      let token: string = await this.passwordService.generateRandomString(32);
      this.logger.log(`Generated token='${token}' to restore user email='${email}'`);
      await this.verificationRepository.createVerification(email, userId, token, VerificationType.PASSWORD, t)
      let ipInfo = await this.ipCacheService.getIpString(ip);
      await this.emailService.sendRestorePasswordEmail(username, userId, email, token, ip, ipInfo)
    });
  }

  public async acceptToken(body: AcceptTokenRequest): Promise<AcceptTokenResponse> {
    return this.sequelize.transaction(async(t) => {
      let verificationModel: VerificationModel = await this.verificationRepository.getVerification(body.token, t);
      this.doTokenVerification(verificationModel, VerificationType.PASSWORD);
      let password = await this.passwordService.createPassword(body.password);
      this.logger.log(`Generated newPassword='${password}' for verification='${verificationModel.id}' for userId=${verificationModel.userId}`);
      await this.userRepository.updateUserPassword(verificationModel.userId, password, t)
      await this.verificationRepository.markVerificationVerified(verificationModel.id, t);
      let session = await this.sessionService.createAndSaveSession(verificationModel.userId);
      let result: AcceptTokenResponse = {
        session
      }
      return result;
    })
  }

  public async confirmEmail(body: ConfirmEmailRequest): Promise<void> {
     await this.sequelize.transaction(async(t) => {
      let verificationModel: VerificationModel = await this.verificationRepository.getVerification(body.token, t);
      this.doTokenVerification(verificationModel, VerificationType.REGISTER);
      await this.verificationRepository.markVerificationVerified(verificationModel.id , t);
      await this.verificationRepository.setUserVerification(verificationModel.userId, verificationModel.id , t);
    })
  }
}