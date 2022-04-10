export interface LoginRequest {
  username: string;
  password: string;
}

// ISO/IEC 5218 1 male, 2 - female
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MessageStatus {
  ON_SERVER = 'ON_SERVER',  // uploaded to server
  READ = 'READ',
  RECEIVED = 'RECEIVED', //sent
}
export enum Theme {
  COLOR_LOR = 'COLOR_LOR',
  COLOR_REG = 'COLOR_REG',
  COLOR_WHITE = 'COLOR_WHITE'
}


export enum VerificationType {
  REGISTER = 'REGISTER',
  PASSWORD = '  PASSWORD = \'p\',\n',
  EMAIL = 'EMAIL',
  CONFIRM_EMAIL = 'CONFIRM_EMAIL',
}

export enum ImageType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  GIPHY=  'GIPHY'
}
export enum  UploadedFileChoices {
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  MEDIA_RECORD= 'MEDIA_RECORD',
  AUDIO_RECORD = 'AUDIO_RECORD',
  IMAGE = 'IMAGE',
  PREVIEW = 'PREVIEW',
  ISSUE = 'ISSUE'
}
