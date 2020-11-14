import { IS_ANDROID } from '@/utils/consts';
import {
  permissions_type,
  PlatformUtil
} from '@/types/model';
import type cordova from 'cordova';
import loggerFactory from '@/instances/loggerFactory';
import { Logger } from 'lines-logger';

export class AndroidPlatformUtil implements PlatformUtil {

  private logger: Logger;

  constructor() {
    this.logger = loggerFactory.getLoggerColor('native', 'red');
  }

  public async askPermissions(...askedPermissions: permissions_type): Promise<void> {
    if (IS_ANDROID) {
      let permissions = (window.cordova.plugins as any).permissions;
      let requiredPermissions: permissions_type= [];
      if (askedPermissions.includes('audio')) {
        requiredPermissions.push(permissions.MODIFY_AUDIO_SETTINGS, permissions.RECORD_AUDIO)
      }
      if (askedPermissions.includes('video')) {
        requiredPermissions.push(permissions.CAMERA)
      }
      if (!askedPermissions.length) {
        throw Error("no persmissins asked")
      }
      this.logger.debug("Checking if user already has permissions for {}", permissions)();
      await requiredPermissions.map(permission => new Promise((resolve, reject) => {
        permissions.checkPermission(permission, (status: any)=> {
          this.logger.debug("permission {} status {}", permission, status)();
          if (status.hasPermission) {
            requiredPermissions = requiredPermissions.filter(a => a === permission);
          }
          resolve()
        }, reject)
      }));

      if (!requiredPermissions.length) {
        this.logger.debug("Permissions {} are already acquired", permissions)();
      } else {
        this.logger.debug("Asking  {} permissions", permissions)();
        await new Promise((resolve, reject) => {
          permissions.requestPermissions(requiredPermissions, (status: any) => {
            if( !status.hasPermission ) {
              reject('User rejected permissions');
            } else {
              resolve();
            }
          }, () => reject('Internal error, cannot get user permissions'));
        });
        this.logger.debug("Permissions {} granted", permissions)();
      }
    }
  }
}

export class NullPlatformUtil implements PlatformUtil {
  public async askPermissions(...askedPermissions: permissions_type): Promise<void> {
    return;
  }
}
