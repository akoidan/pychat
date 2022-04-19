// ISO/IEC 5218 1 male, 2 - female
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum MessageStatus {
  ON_SERVER = "ON_SERVER", // Uploaded to server
  READ = "READ",
  RECEIVED = "RECEIVED", // Sent
}

export enum Theme {
  COLOR_LOR = "COLOR_LOR",
  COLOR_REG = "COLOR_REG",
  COLOR_WHITE = "COLOR_WHITE",
}


export enum VerificationType {
  REGISTER = "REGISTER", // When user sign up with email, we want to confirm that it's his/her email
  PASSWORD = "PASSWORD", // When user request a pasword change
  EMAIL = "EMAIL", // When user changes an email
}

export enum ImageType {
  VIDEO = "VIDEO",
  FILE = "FILE",
  MEDIA_RECORD = "MEDIA_RECORD",
  AUDIO_RECORD = "AUDIO_RECORD",
  IMAGE = "IMAGE",
  PREVIEW = "PREVIEW",
  GIPHY = "GIPHY",
}
