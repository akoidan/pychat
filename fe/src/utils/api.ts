import Xhr from './Xhr';
import {RESPONSE_SUCCESS} from './consts';
import {UploadFile} from '../types/types';
import {MessageModelDto, UserProfileDto, UserSettingsDto} from '../types/dto';
import {UserModel} from '../types/model';

export default class Api {
  private xhr: Xhr;

  constructor(xhr: Xhr) {
    this.xhr = xhr;
  }

  public login(form: HTMLFormElement, cb: ErrorCB<string>) {
    this.xhr.doPost<any>({
      url: '/auth',
      formData: new FormData(form),
      cb
    });
  }


  public sendLogs(issue: string, browser: string, cb: SingleParamCB<string> = null) {
    this.xhr.doPost<string>({
      url: '/report_issue',
      params: {issue, browser},
      cb: this.getResponseSuccessCB(cb),
    });
  }

  public search(data: string, room: number, offset: number, cb: ErrorCB<MessageModelDto[]>): XMLHttpRequest {
   return this.xhr.doPost<MessageModelDto[]>({
      url: '/search_messages',
      params: {data, room, offset},
      isJsonDecoded: true,
      cb
    });
  }

  public changePassword(old_password: string, password: string, cb: SingleParamCB<string>) {
    return this.xhr.doPost<MessageModelDto[]>({
      url: '/change_password',
      params: {old_password, password},
      cb: this.getResponseSuccessCB(cb)
    });
  }

  public logout(cb: SingleParamCB<string>, registration_id: string = null) {
    this.xhr.doPost({
      url: '/logout',
      params: {registration_id},
      cb: (d, e) => {
        if (e) {
          e = `Error while logging out ${e}`;
        }
        cb(e);
      }
    });
  }

  public sendRestorePassword(form: HTMLFormElement, cb: SingleParamCB<string>) {
    this.xhr.doPost({
      url: '/send_restore_password',
      formData: new FormData(form),
      cb: this.getResponseSuccessCB(cb)
    });
  }

  public register(form: HTMLFormElement, cb: ErrorCB<string>) {
    this.xhr.doPost<string>({
      url: '/register',
      formData: new FormData(form),
      cb
    });
  }

  public validateUsername(username: string, cb: SingleParamCB<string>) {
    this.xhr.doPost({
      url: '/validate_user',
      params: {username},
      cb: this.getResponseSuccessCB(cb)
    });
  }

  private getResponseSuccessCB(cb: SingleParamCB<string>) {
    return (data, error) => {
      if (!cb) {
      } else if (error) {
        cb(error);
      } else if (data === RESPONSE_SUCCESS) {
        cb(null);
      } else if (data) {
        cb(data);
      } else {
        cb('Unknown error');
      }
    };
  }

  public sendRoomSettings(roomName, volume, notifications, roomId, cb: SingleParamCB<string>) {
    this.xhr.doPost( {
      url: '/save_room_settings',
      params: {roomName, volume, notifications, roomId},
      cb: this.getResponseSuccessCB(cb)
    });
  }

  public uploadProfileImage(file: Blob, cb: SingleParamCB<string>) {
    let fd = new FormData();
    fd.append('file', file);
    this.xhr.doPost<string>( {
      url: '/upload_profile_image',
      formData: fd,
      cb: this.getResponseSuccessCB(cb)
    });
  }


  public uploadFiles(files: UploadFile[], cb: ErrorCB<number[]>, progress: Function) {
    let fd = new FormData();
    files.forEach(function(sd) {
      fd.append(sd.type + sd.symbol, sd.file, sd.file.name);
    });
    this.xhr.doPost<number[]>({
      url: '/upload_file',
      isJsonDecoded: true,
      formData: fd,
      process: r => {
        r.upload.addEventListener('progress', progress);
      },
      cb});
  }

  public validateEmail(email: string, cb: SingleParamCB<string>) {
    this.xhr.doPost({
      url: '/validate_email',
      params: {email},
      cb: this.getResponseSuccessCB(cb)
    });
  }
}