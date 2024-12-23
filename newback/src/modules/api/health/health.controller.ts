import {
  Controller,
  Get,
} from "@nestjs/common";
import {HealthService} from "@/modules/api/health/health.service";
import type {HealthResponse} from "@/data/types/api";


@Controller({
  path: "/api/health",
})
export class HealthController {
  public constructor(private readonly healthService: HealthService) {
  }

  @Get()
  public async auth(): Promise<HealthResponse> {
    return this.healthService.checkHealth();
  }
}

