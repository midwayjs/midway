import { Provide, Inject, Config, Scope, ScopeEnum } from '@midwayjs/core';
import { CacheManager } from '@midwayjs/cache';
import * as svgCaptcha from 'svg-captcha';
import * as svgBase64 from 'mini-svg-data-uri';
import { nanoid } from 'nanoid';
import {
  FormulaCaptchaOptions,
  ImageCaptchaOptions,
  TextCaptchaOptions,
  CaptchaOptions,
} from './interface';
import { letters, numbers } from './constants';
@Provide()
@Scope(ScopeEnum.Singleton)
export class CaptchaService {
  @Inject()
  cacheManager: CacheManager;

  @Config('captcha')
  captcha: CaptchaOptions;

  async image(options?: ImageCaptchaOptions): Promise<{
    id: string;
    imageBase64: string;
  }> {
    const { width, height, type, size, noise } = Object.assign(
      {},
      this.captcha,
      this.captcha.default,
      this.captcha.image,
      options
    );
    let ignoreChars = '';
    switch (type) {
      case 'letter':
        ignoreChars = numbers;
        break;
      case 'number':
        ignoreChars = letters;
        break;
    }
    const { data, text } = svgCaptcha.create({
      ignoreChars,
      width,
      height,
      size,
      noise,
    });
    const id = await this.set(text);
    const imageBase64 = svgBase64(data);
    return { id, imageBase64 };
  }

  async formula(options?: FormulaCaptchaOptions) {
    const { width, height, noise } = Object.assign(
      {},
      this.captcha,
      this.captcha.default,
      this.captcha.formula,
      options
    );
    const { data, text } = svgCaptcha.createMathExpr({
      width,
      height,
      noise,
    });
    const id = await this.set(text);
    const imageBase64 = svgBase64(data);
    return { id, imageBase64 };
  }

  async text(options?: TextCaptchaOptions): Promise<{
    id: string;
    text: string;
  }> {
    const textOptions = Object.assign(
      {},
      this.captcha,
      this.captcha.default,
      this.captcha.text,
      options
    );
    let chars = '';
    switch (textOptions.type) {
      case 'letter':
        chars = letters;
        break;
      case 'number':
        chars = numbers;
        break;
      default:
        chars = letters + numbers;
        break;
    }
    let text = '';
    while (textOptions.size--) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }
    const id = await this.set(text);
    return { id, text };
  }

  async set(text: string): Promise<string> {
    const id = nanoid();
    await this.cacheManager.set(
      this.getStoreId(id),
      (text || '').toLowerCase(),
      { ttl: this.captcha.expirationTime }
    );
    return id;
  }

  async check(id: string, value: string): Promise<boolean> {
    if (!id || !value) {
      return false;
    }
    const storeId = this.getStoreId(id);
    const storedValue = await this.cacheManager.get(storeId);
    if (value.toLowerCase() !== storedValue) {
      return false;
    }
    this.cacheManager.del(storeId);
    return true;
  }

  private getStoreId(id: string): string {
    if (!this.captcha.idPrefix) {
      return id;
    }
    return `${this.captcha.idPrefix}:${id}`;
  }
}
