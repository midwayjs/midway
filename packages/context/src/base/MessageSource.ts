import { format } from 'util';
import * as _ from 'lodash';
import {
  Locale,
  IResource,
  IMessageSource
} from '../interfaces';

/**
 * 多语言支持实现
 * 支持文件夹载入以及文件载入
 */
export class MessageSource extends Map implements IMessageSource {
  private _defaultLocale: Locale = null;

  constructor(defaultLocale: Locale) {
    super();
    this._defaultLocale = defaultLocale;
  }

  async load(locale: Locale, res: IResource): Promise<void> {
    if (res.isFile()) {
      let messages = await res.getContentAsJSON();

      if (this.has(locale)) {
        _.assign(this.get(locale), messages);
      } else {
        this.set(locale, messages);
      }
    }

    if (res.isDir()) {
      const resources = await res.getSubResources();
      for (let i = 0; i < resources.length; i++) {
        await this.load(locale, resources[i]);
      }
    }
  }

  async loadUseFileName(res: IResource): Promise<void> {
    if (res.isFile()) {
      let messages = await res.getContentAsJSON();
      const locale = res.name;

      if (this.has(locale)) {
        _.assign(this.get(locale), messages);
      } else {
        this.set(locale, messages);
      }
    }

    if (res.isDir()) {
      const resources = await res.getSubResources();
      for (let i = 0; i < resources.length; i++) {
        await this.loadUseFileName(resources[i]);
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
      messages = this.get(this._defaultLocale);
    }

    if (!messages) {
      return null;
    }

    if (!messages[code]) {
      return defaultMessage;
    }

    if (args && args.length > 0) {
      return format(messages[code], args);
    }
    return messages[code];
  }
}
