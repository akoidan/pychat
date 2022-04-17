import {Test} from "@nestjs/testing";
import {LoggerModule} from "@/modules/rest/logger/logger.module";
import {ConsoleLogger} from "@nestjs/common";
import {ImageService} from "@/modules/api/file/image.service";
import {PasswordService} from "@/modules/rest/password/password.service";

describe("ImageService", () => {
  let imgService: ImageService;
  let passwordService: PasswordService;
  let moduleFixture;
  beforeAll(
    async() => {
      moduleFixture = await Test.createTestingModule({
        imports: [LoggerModule],
        providers: [
          ImageService,
          PasswordService,
        ],
      }).setLogger(new ConsoleLogger()).
        compile();
      imgService = moduleFixture.get(ImageService);
      passwordService = moduleFixture.get(PasswordService);
    }
  );
  afterAll(async() => {
    await moduleFixture.close();
  });


  describe("getName", () => {
    it("remove old ext", async() => {
      passwordService.generateRandomString = jest.fn().mockResolvedValue("test");
      await expect(imgService.getName("name.jpeg", "webp", "jpeg")).
        resolves.
        toEqual("test_name.webp");
    });
    it("keep origin extension", async() => {
      passwordService.generateRandomString = jest.fn().mockResolvedValue("test");
      await expect(imgService.getName("name.jpeg", "", "")).
        resolves.
        toEqual("test_name.jpeg");
    });
    it("keep origin esxtension", async() => {
      passwordService.generateRandomString = jest.fn().mockResolvedValue("test");
      await expect(imgService.getName("name.jpeg", "jpeg", "jpeg")).
        resolves.
        toEqual("test_name.jpeg");
    });
  });
});
