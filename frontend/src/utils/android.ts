import {IS_ANDROID} from '@/utils/consts';
import type cordova from 'cordova'


export async function askAudioPermissions(videoAsWell: boolean) {
  if (IS_ANDROID) {
    let permissions = (window.cordova.plugins as any).permissions;
    let requiredPermissions = [permissions.MODIFY_AUDIO_SETTINGS, permissions.RECORD_AUDIO];
    if (videoAsWell) {
      requiredPermissions.push(permissions.CAMERA)
    }
    let hasPermissions: boolean = await new Promise((resolve, reject) => {
      permissions.hasPermission((status: any)=> resolve(status.hasPermission as boolean))
    });
    if (!hasPermissions) {
      await new Promise((resolve, reject) => {
        permissions.requestPermissions(requiredPermissions, (status: any) => {
          if( !status.hasPermission ) {
            reject('user rejected permissions');
          } else {
            resolve();
          }
        }, () => reject('cannot get permissions'));
      })
    }
  }
}

