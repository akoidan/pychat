import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {HtmlService} from "@/modules/rest/html/html.service";
import {MailerService} from "@nestjs-modules/mailer";
import {ConfigService} from "@/modules/rest/config/config.service";

@Injectable()
export class EmailService {
  public constructor(
    private readonly htmlService: HtmlService,
    private readonly loggerService: Logger,
    private readonly configService: ConfigService,
    private readonly mailerService?: MailerService,
  ) {
  }

  public async sendRestorePasswordEmail(username: string, userId: number, email: string, token, ip: string, ipInfo: string) {
    const context = {
      username,
      timeCreated: (new Date() as any).toGMTString(),
      magicLink: `${this.configService.getConfig().frontend.address}/#/auth/proceed-reset-password?token=${token}`,
      ip,
      site: this.configService.getConfig().frontend.address,
      ipInfo,
    };
    await this.sendEmail("change.password.start", userId, email, "Reset pychat password", context);
  }

  public async sendSignUpEmail(username: string, userId: number, email: string, token, ip: string, ipInfo: string) {
    const context: Record<string, string> = {
      issueReportLink: this.configService.getConfig().frontend.issueReportLink,
      magicLink: `${this.configService.getConfig().frontend.address}/#/confirm-email?token=${token}`,
      username,
      ip,
      timeCreated: (new Date() as any).toGMTString(),
      ipInfo,
    };
    await this.sendEmail("sign.up.email", userId, email, "Confirm Pychat registration", context);
  }

  private async sendEmail(templateName: string, userId, email, subject: string, context: Record<string, string>) {
    if (!this.configService.getConfig().email) {
      this.loggerService.warn(`Email to userId ${userId} ${email} won't be sent since email settings is not set in config`);
      return;
    }
    const html = await this.htmlService.renderTemplate(`${templateName}.html`, context);
    const text = await this.htmlService.renderTemplate(`${templateName}.txt`, context);
    this.loggerService.log(`Sending email to userId ${userId} ${email}`);
    await this.mailerService.sendMail({
      to: email,
      html,
      text,
      subject,
    });
  }
}
