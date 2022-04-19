import {Module} from "@nestjs/common";
import {
  MailerModule,
  MailerService,
} from "@nestjs-modules/mailer";
import {config} from "node-ts-config";
import {EmailService} from "@/modules/shared/email/email.service";
import {HtmlService} from "@/modules/shared/html/html.service";


@Module({
  imports: [
    ...config.email ? [
      MailerModule.forRoot({
        transport: config.email as any,
      }),
    ] : [],
  ],
  providers: [
    ...!config.email ? [
      {
        provide: MailerService,
        useValue: null,
      },
    ] : [],
    EmailService,
    HtmlService,
  ],
  exports: [EmailService],
})
export class EmailModule {
}