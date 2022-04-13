import {
  Injectable,
  Logger
} from '@nestjs/common';
import {HtmlService} from '@/modules/html/html.service';
import {MailerService} from '@nestjs-modules/mailer';
import {ConfigService} from '@/modules/config/config.service';

@Injectable()
export class EmailSenderService {
  public constructor(
    private readonly htmlService: HtmlService,
    private readonly loggerService: Logger,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {
  }

  public async sendRestorePasswordEmail(username: string, userId: number, email: string, token, ip: string, ipInfo: string) {
    let context = {
      username,
      timeCreated: (new Date() as any).toGMTString(),
      magicLink: `${this.configService.getConfig().frontend.address}/#/auth/proceed-reset-password?token=${token}`,
      ip,
      site: this.configService.getConfig().frontend.address,
      ipInfo
    };
    await this.sendEmail('change_password_start', userId, email, 'Confirm pychat registration', context);
  }

  private async sendEmail(templateName: string, userId, email, subject: string, context: Record<string, string>) {
    if (!this.configService.getConfig().email) {
      this.loggerService.warn(`Email to userId ${userId} ${email} won't be sent since email settings is not set in config`);
      return
    }
    let html = await this.htmlService.renderTemplate(`${templateName}.html`, context);
    let text = await this.htmlService.renderTemplate(`${templateName}.txt`, context);
    this.loggerService.log(`Sending email to userId ${userId} ${email}`)
    await this.mailerService.sendMail({
      to: email,
      html,
      text,
      subject
    })
  }

  public async sendSignUpEmail(username: string, userId: number, email: string, token, ip: string, ipInfo: string) {
    let context: Record<string, string> = {
      issueReportLink: this.configService.getConfig().frontend.issueReportLink,
      magicLink: `${this.configService.getConfig().frontend.address}/#/confirm_email?token=${token}`,
      username,
      ip,
      timeCreated: (new Date() as any).toGMTString(),
      ipInfo
    };
    await this.sendEmail('sign_up_email', userId, email, 'Confirm pychat registration', context);
  }

}
