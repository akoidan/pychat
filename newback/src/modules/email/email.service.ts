import {Injectable} from '@nestjs/common';
import {config} from 'node-config-ts';

@Injectable()
export class EmailService {
  public constructor() {
  }


  public sendSignUpEmail(username: string, email: string, token) {
		const link = `${config.frontend.address}/#/confirm_email?token=${token}`;
		const text = `Hi ${username}, you have registered pychat` +
						`\nTo complete your registration please click on the url bellow: ${link}` +
						`\n\nIf you find any bugs or propositions you can post them ${config.frontend.issueReportLink}`;
)
		self.logger.info('Sending verification email to userId %s (email %s)', user.id, user.email)
		yield self.__send_mail(
			"Confirm chat registration",
			text,
			user.email,
			html_message,
			True
		)

  }

  public async sendEmail(templateId: 'change_email' | 'change_password' | 'sign_up_email' | 'token_email', params: Record<string, string>): Promise<void> {
    void 0;
  }
}
