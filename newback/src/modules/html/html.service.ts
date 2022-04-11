import {Injectable} from '@nestjs/common';
import {readFile} from 'fs';
import {promisify} from 'util';
import {sep} from "path";

@Injectable()
export class HtmlService {

  public replaceTemplate(content: string, params: Record<string, string | number>): string {
    const replaceHtmlRegex = /\{\{\s?(\w+)\s?\}\}/g;
    const html = content.replace(replaceHtmlRegex, (_, v) => {
      if (!params[v]) {
        throw Error(`Unable to render template. '${v}' is missing in ${JSON.stringify(params)}`)
      }
      return params[v] as string
    });
    return html;
  }

  public async renderTemplate(template: string, params: Record<string, string | number>) {
    let filePath = ['src', 'templates', `${template}.html`].join(sep);
    const content = await promisify(readFile)(filePath, 'utf-8');
    return this.replaceTemplate(content, params);
  }
}
