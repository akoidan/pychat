import {Module} from '@nestjs/common';
import {MailerModule} from '@nestjs-modules/mailer';
import {config} from 'node-config-ts';
import {EmailSenderService} from '@/modules/email.render/email.sender.service';
import {HtmlService} from '@/modules/html/html.service';


@Module({
  imports: [
    MailerModule.forRoot({
      transport: config.email
    })
  ],
  providers: [
    EmailSenderService,
    HtmlService
  ],
  exports: [
    EmailSenderService
  ]
})
export class EmailModule {
}
