import {Module} from '@nestjs/common';
import {MailerModule} from '@nestjs-modules/mailer';
import {config} from 'node-ts-config';
import {EmailSenderService} from '@/modules/email.render/email.sender.service';
import {HtmlService} from '@/modules/html/html.service';


@Module({
  imports: [
    MailerModule.forRoot({
      transport: config.email as any
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
