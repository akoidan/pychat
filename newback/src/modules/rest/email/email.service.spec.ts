import {HtmlService} from "@/modules/rest/html/html.service";
import {EmailService} from "@/modules/rest/email/email.service";
import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {LoggerModule} from "@/modules/rest/logger/logger.module";
import {MailerService} from "@nestjs-modules/mailer";

import {readFile} from "fs/promises";
import {resolve} from "path";
import {ConsoleLogger} from "@nestjs/common";
import {ConfigService} from "@/modules/rest/config/config.service";
import {config} from "node-ts-config";

describe("EmailSenderService", () => {
  let sender: EmailService;
  let moduleFixture: TestingModule;
  let mailer: MailerService;
  const configService: ConfigService = {} as ConfigService;
  beforeAll(
    async() => {
      moduleFixture = await Test.createTestingModule({
        imports: [LoggerModule],
        providers: [
          {
            provide: ConfigService,
            useValue: configService,
          },
          {
            provide: MailerService,
            useValue: {sendMail: () => jest.fn().mockResolvedValue(undefined)},
          },
          HtmlService,
          EmailService,
        ],
      }).setLogger(new ConsoleLogger()).
        compile();
      sender = moduleFixture.get(EmailService);
      mailer = moduleFixture.get(MailerService);
    }
  );
  afterAll(async() => {
    await moduleFixture.close();
  });

  beforeAll(() => {
    configService.getConfig = jest.fn().mockReturnValue(config);
    jest.clearAllMocks();
  });

  describe("sendRestorePasswordEmail", () => {
    it("time should always be UTC", () => { // https://stackoverflow.com/a/56482581/3872976
      /*
       * Test below depends on new date to return specific time
       * we mock it with jest, but it still depends on machine timezone so we need to ensure tz is same
       * jest.setup.js fixes it
       */
      expect(new Date().getTimezoneOffset()).toBe(0);
    });
    it("should render an email", async() => {
      configService.getConfig = jest.fn().mockReturnValue({
        ...config,
        email: {},
      });
      const spy = jest.spyOn(mailer, "sendMail");
      jest.useFakeTimers("modern");
      jest.setSystemTime(new Date(2020, 3, 1));
      await sender.sendRestorePasswordEmail("a", 3, "a@a", "sfsd", "192.168.1.1", "Chernihiv");
      const content = await readFile(resolve(__dirname, "..", "..", "..", "fixtures", "rendered.send.restore.password.html"), "utf-8");
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        html: content,
        subject: "Reset pychat password",
        text: expect.any(String),
      }));
    });
  });

  describe("sendSignUpEmail", () => {
    it("should render", async() => {
      const spy = jest.spyOn(mailer, "sendMail");
      jest.useFakeTimers("modern");
      jest.setSystemTime(new Date(2020, 3, 1));
      await sender.sendSignUpEmail("a", 3, "a@a", "sfsd", "192.168.1.1", "Chernihiv");
      const content = await readFile(resolve(__dirname, "..", "..", "..", "fixtures", "send.sign.up.email.html"), "utf-8");
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        html: content,
        subject: "Confirm Pychat registration",
        text: expect.any(String),
      }));
    });
  });
});
