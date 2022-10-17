import { Provide, Inject, Config, Scope, ScopeEnum } from '@midwayjs/core';
import { CacheManager } from '@midwayjs/cache';
import * as svgCaptcha from 'svg-captcha';
import * as svgBase64 from 'mini-svg-data-uri';
import { nanoid } from 'nanoid';
import {
  FormulaVerificationCodeOptions,
  ImageVerificationCodeOptions,
  TextVerificationCodeOptions,
  VerificationCodeOptions,
} from './interface';
import { letters, numbers } from './constants';
@Provide()
@Scope(ScopeEnum.Singleton)
export class VerificationCodeService {
  @Inject()
  cacheManager: CacheManager;

  @Config('verificationCode')
  verificationCode: VerificationCodeOptions;

  async image(options?: ImageVerificationCodeOptions): Promise<{
    id: string;
    imageBase64: string;
  }> {
    const { width, height, type } = Object.assign(
      {},
      this.verificationCode,
      this.verificationCode.image,
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
    });
    const id = await this.set(text);
    const imageBase64 = svgBase64(data);
    return { id, imageBase64 };
  }

  async formula(options?: FormulaVerificationCodeOptions) {
    const { width, height } = Object.assign(
      {},
      this.verificationCode,
      this.verificationCode.formula,
      options
    );
    const { data, text } = svgCaptcha.createMathExpr({
      width,
      height,
    });
    const id = await this.set(text);
    const imageBase64 = svgBase64(data);
    return { id, imageBase64 };
  }

  async text(options?: TextVerificationCodeOptions): Promise<{
    id: string;
    text: string;
  }> {
    const textOptions = Object.assign(
      {},
      this.verificationCode,
      this.verificationCode.text,
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
      { ttl: this.verificationCode.expirationTime }
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
    return `${this.verificationCode}:${id}`;
  }
}
