import * as _ from '../common/lodashWrap';
import { format } from 'util';
import { IMessageSource, IResource, Locale } from '../interface';

/**
 * 多语言支持实现
 * 支持文件夹载入以及文件载入
 */
export class MessageSource extends Map implements IMessageSource {
  private defaultLocale: Locale = null;

  constructor(defaultLocale: Locale) {
    super();
    this.defaultLocale = defaultLocale;
  }

  async load(locale: Locale, res: IResource): Promise<void> {
    if (res.isFile()) {
      const messages = await res.getContentAsJSON();

      if (this.has(locale)) {
        _.assign(this.get(locale), messages);
      } else {
        this.set(locale, messages);
      }
    }

    if (res.isDir()) {
      const resources = await res.getSubResources();
      for (const resource of resources) {
        await this.load(locale, resource);
      }
    }
  }

  async loadUseFileName(res: IResource): Promise<void> {
    if (res.isFile()) {
      const messages = await res.getContentAsJSON();
      const locale = res.name;

      if (this.has(locale)) {
        _.assign(this.get(locale), messages);
      } else {
        this.set(locale, messages);
      }
    }

    if (res.isDir()) {
      const resources = await res.getSubResources();
      for (const resource of resources) {
        await this.loadUseFileName(resource);
      }
    }
  }

  getMessage(code: string,
             args?: any[],
             defaultMessage?: string,
             locale?: Locale): string {

    let messages;
    if (locale) {
      messages = this.get(locale);
    } else {
      messages = this.get(this.defaultLocale);
    }

    if (!messages) {
      return null;
    }

    if (!messages[code]) {
      return defaultMessage;
    }

    if (args && args.length > 0) {
      args.unshift(messages[code]);
      return format.apply(null, args);
    }
    return messages[code];
  }
}
