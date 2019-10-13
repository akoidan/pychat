import Xhr from '@/utils/Xhr';
import {CONNECTION_ERROR, RESPONSE_SUCCESS} from '@/utils/consts';
import {UploadFile} from '@/types/types';
import {MessageModelDto} from '@/types/dto';
import {DefaultMessage, ViewUserProfileDto} from '@/types/messages';
import MessageHandler, {HandlerTypes} from '@/utils/MesageHandler';
import loggerFactory from '@/utils/loggerFactory';
import {Logger} from 'lines-logger';
import Http from '@/utils/Http';
import {sub} from '@/utils/sub';
import sessionHolder from '@/utils/sessionHolder';

export default class Api extends MessageHandler {
  private readonly  xhr: Http;
  protected readonly handlers: HandlerTypes = {
    internetAppear: this.internetAppear
  };

  private internetAppear(m: DefaultMessage): void {
    if (this.retryFcb) {
      this.retryFcb();
    }
  }

  private retryFcb: Function|null = null;

  protected readonly logger: Logger;

  constructor(xhr: Http) {
    super();
    sub.subscribe('lan', this);
    this.logger = loggerFactory.getLoggerColor('api', 'red');
    this.xhr = xhr;
  }

  public async login(form: HTMLFormElement): Promise<string> {
    return await this.xhr.doPost<string>({
      url: '/auth',
      formData: new FormData(form)
    });
  }


  public async sendLogs(issue: string, browser: string): Promise<void> {
    let result: string = await this.xhr.doPost<string>({
      url: '/report_issue',
      params: {issue, browser},
      checkOkString: true,
    });
  }

  public async search(
      data: string,
      room: number,
      offset: number,
      requestInterceptor?: (a: XMLHttpRequest) => void
  ): Promise<MessageModelDto[]> {
   return await this.xhr.doPost<MessageModelDto[]>({
      url: '/search_messages',
      params: {data, room, offset},
      isJsonDecoded: true,
      requestInterceptor,
    });
  }

  public async changePassword(old_password: string, password: string): Promise<void> {
    return await this.xhr.doPost<void>({
      url: '/change_password',
      params: {old_password, password},
      checkOkString: true,
    });
  }

  public async logout(registration_id: string |null= null): Promise<void> {
    await this.xhr.doPost({
      url: '/logout',
      params: {registration_id},
      errorDescription: `Error while logging out: `
    });
  }

  public async sendRestorePassword(form: HTMLFormElement): Promise<void> {
    return await this.xhr.doPost<void>({
      url: '/send_restore_password',
      formData: new FormData(form),
      checkOkString: true,
    });
  }

  public async register(form: HTMLFormElement): Promise<string> {
    return await this.xhr.doPost<string>({
      url: '/register',
      formData: new FormData(form),
    });
  }

  public async registerDict(password: string, username: string): Promise<string> {
    return await this.xhr.doPost<string>({
      url: '/register',
      params: {username, password}
    });
  }

  public async googleAuth(token: string): Promise<string> {
    let res: string =  await this.xhr.doPost<string>({
      url: '/google_auth',
      params: {
        token
      }
    });
    this.checkSessionToken(res);
    return res;
  }

  private checkSessionToken(token: string) {
    if (!/\w{32}/.exec(token)) {
      throw token;
    }
  }

  public async facebookAuth(token: string): Promise<string> {
    let res: string = await this.xhr.doPost<string>({
      url: '/facebook_auth',
      params: {
        token
      }
    });
    this.checkSessionToken(res);
    return res;

  }

  public async statistics(): Promise<void> {
    return await this.xhr.doGet('/statistics', true);
  }

  public async loadGoogle(): Promise<void> {
    return await this.xhr.loadJs('https://apis.google.com/js/platform.js');
  }

  public async loadFacebook(): Promise<void> {
    return await this.xhr.loadJs('https://connect.facebook.net/en_US/sdk.js');
  }

  public async loadRecaptcha(): Promise<void> {
    return await this.xhr.loadJs('https://www.google.com/recaptcha/api.js');
  }


  public async registerFCB(registration_id: string, agent: string, is_mobile: boolean): Promise<void> {
    try {
      return await this.xhr.doPost({
        url: '/register_fcb',
        params: {
          registration_id,
          agent,
          is_mobile
        },
        checkOkString: true,
      });
    } catch (e) {
      if (e === CONNECTION_ERROR) {
        this.retryFcb = () => {
          this.registerFCB(registration_id, agent, is_mobile);
        };
      } else {
        this.retryFcb = null;
      }
      throw e;
    }
  }


  public async validateUsername(username: string, requestInterceptor: (r: XMLHttpRequest) => void): Promise<void> {
    return await this.xhr.doPost({
      url: '/validate_user',
      params: {username},
      checkOkString: true,
    });
  }


  public async sendRoomSettings(roomName: string, volume: number, notifications: boolean, roomId: number): Promise<void> {
    return await this.xhr.doPost( {
      url: '/save_room_settings',
      params: {roomName, volume, notifications, roomId},
      checkOkString: true,
    });
  }

  public async uploadProfileImage(file: Blob): Promise<void> {
    let fd = new FormData();
    fd.append('file', file);
    return await this.xhr.doPost<void>( {
      url: '/upload_profile_image',
      formData: fd,
      checkOkString: true,
    });
  }

  public async showProfile(id: number): Promise<ViewUserProfileDto> {
    return await this.xhr.doGet<ViewUserProfileDto>(`/profile?id=${id}`, true);
  }

  public async changeEmail(token: string): Promise<string> {
    return this.xhr.doGet<string>(`/change_email?token=${token}`, false);
  }

  public async changeEmailLogin(email: string, password: string): Promise<void> {
    return await this.xhr.doPost({
      url: '/change_email_login',
      checkOkString: true,
      params: {email, password}
    });
  }

  public async confirmEmail(token: string): Promise<string> {
    return await this.xhr.doGet<string>(`/confirm_email?token=${token}`, false);
  }

  public async uploadFiles(files: UploadFile[], progress: (e: ProgressEvent) => void): Promise<number[]> {
    let fd = new FormData();
    files.forEach(sd => fd.append(sd.type + sd.symbol, sd.file, sd.file.name));
    return await this.xhr.doPost<number[]>({
      url: '/upload_file',
      isJsonDecoded: true,
      formData: fd,
      process: r => {
        r.upload.addEventListener('progress', progress);
      }
    });
  }

  public async validateEmail(email: string, requestInterceptor: (r: XMLHttpRequest) => void): Promise<void> {
    return this.xhr.doPost({
      url: '/validate_email',
      params: {email},
      checkOkString: true,
      requestInterceptor,
    });
  }

  public async verifyToken(token: string): Promise<string> {
    let value: { message: string, restoreUser: string } = await this.xhr.doPost<{ message: string, restoreUser: string}>({
      url: '/verify_token',
      isJsonDecoded: true,
      params: {token}
    });
    if (value && value.message === RESPONSE_SUCCESS) {
      return value.restoreUser;
    } else {
      throw value.message;
    }
  }

  public async acceptToken(token: string, password: string): Promise<void> {
    return await this.xhr.doPost({
      url: '/accept_token',
      params: {token, password},
      checkOkString: true,
    });
  }
}
