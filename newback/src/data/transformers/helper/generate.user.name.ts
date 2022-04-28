import {MAX_USERNAME_LENGTH,} from "@/data/consts";

export function generateUserName(email: string) {
  return email.split("@")[0].replace(/[^0-9a-zA-Z-_]+/g, "-").substring(0, MAX_USERNAME_LENGTH);
}
