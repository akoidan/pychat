import type {
  PlatformUtil,
  permissions_type,
} from "@/ts/types/model";

export class WebPlatformUtils implements PlatformUtil {
  public async askPermissions(...askedPermissions: permissions_type): Promise<void> {

  }
}
