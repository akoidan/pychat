import {Injectable} from "@nestjs/common";
import {readFile} from "fs";
import {promisify} from "util";
import {sep} from "path";

@Injectable()
export class HtmlService {
  private cache: Record<string, string> = {};

  public replaceTemplate(content: string, params: Record<string, number | string>): string {
    const replaceHtmlRegex = /\{\{\s?(\w+)\s?\}\}/g;
    return content.replace(replaceHtmlRegex, (_, v) => {
      if (!params[v]) {
        throw Error(`Unable to render template. '${v}' is missing in ${JSON.stringify(params)}`);
      }
      return params[v] as string;
    });
  }

  public async renderTemplate(template: string, params: Record<string, number | string>) {
    const filePath = ["src", "templates", `${template}`].join(sep);
    if (!this.cache[filePath]) {
      this.cache[filePath] = await promisify(readFile)(filePath, "utf-8");
    }
    return this.replaceTemplate(this.cache[filePath], params);
  }
}
