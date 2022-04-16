import type {
  TestingModule,
} from "@nestjs/testing";
import {
  Test,
} from "@nestjs/testing";
import {IpService} from "@/modules/rest/ip/ip.service";
import {HttpModule} from "@/modules/rest/http/http.module";
import * as pychatIpAddressFixture from "@/fixtures/ip.134.249.113.11.json";
import {LoggerModule} from "@/modules/rest/logger/logger.module";
import {ConsoleLogger} from "@nestjs/common";
import {InvalidIpException} from "@/data/exceptions/invalid.ip.exception";

describe("IpService", () => {
  let ipservice: IpService;
  let moduleFixture: TestingModule;
  beforeAll(
    async() => {
      moduleFixture = await Test.createTestingModule({
        imports: [
          LoggerModule,
          HttpModule,
        ],
        providers: [IpService],
      }).setLogger(new ConsoleLogger()).
        compile();
      ipservice = moduleFixture.get(IpService);
    }
  );

  afterAll(async() => {
    await moduleFixture.close();
  });

  beforeAll(() => {
    jest.clearAllMocks();
  });

  describe("getIpInfo", () => {
    it("ip 134.249.113.11 should return correct response", async() => {
      const data = await ipservice.getIpInfo("134.249.113.11");
      expect(data).toEqual(pychatIpAddressFixture);
    });
    it("ip ::ffff:127.0.0.1 should return correct response", async() => {
      await expect(ipservice.getIpInfo("::ffff:127.0.0.1")).rejects.toMatchObject(expect.any(InvalidIpException));
    });
  });
});
