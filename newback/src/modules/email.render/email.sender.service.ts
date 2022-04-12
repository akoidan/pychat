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

  public async sendSignUpEmail(username: string, userId: number, email: string, token, ip: string, ipInfo: string) {
    if (!this.configService.getConfig().email) {
        this.loggerService.warn(`Email to userId ${userId} ${email} won't be sent since email settings is not set in config`);
        return
    }
    const magicLink = `${this.configService.getConfig().frontend.address}/#/confirm_email?token=${token}`;
    let issueReportLink = this.configService.getConfig().frontend.issueReportLink;
    const text = `Hi ${username}, you have registered pychat` +
      `\nTo complete your registration please click on the url bellow: ${magicLink}` +
      `\n\nIf you find any bugs or propositions you can post them ${issueReportLink}`;

    let signUpEmail = await this.htmlService.renderTemplate('sign_up_email', {
      issueReportLink,
      magicLink,
      username,
      btnText: "Confirm chat registration",
    })
    const html = await this.htmlService.renderTemplate('token_email', {
      signUpEmail,
      ip,
      timeCreated: new Date().getTime(),
      ipInfo
    })
    this.loggerService.log(`Sending verification email to userId ${userId} ${email}`)
    await this.mailerService.sendMail({
      to: email,
      html,
      text,
      subject: 'Confirm pychat registration'
    })

  }

}
