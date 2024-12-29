import {
  Provide,
  Config,
  Scope,
  ScopeEnum,
  InjectClient,
} from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import * as svgCaptcha from 'svg-captcha-fixed';
import * as svgBase64 from 'mini-svg-data-uri';
import { nanoid } from 'nanoid';
import {
  FormulaCaptchaOptions,
  ImageCaptchaOptions,
  TextCaptchaOptions,
  CaptchaOptions,
  CaptchaCacheOptions,
} from './interface';
import { letters, numbers } from './constants';

const DEFAULT_IMAGE_IGNORE_CHARS = {
  letter: numbers,
  number: letters,
};

@Provide()
@Scope(ScopeEnum.Singleton)
export class CaptchaService {
  @InjectClient(CachingFactory, 'captcha')
  protected captchaCaching: MidwayCache;

  @Config('captcha')
  protected captcha: CaptchaOptions;

  async image(
    options?: ImageCaptchaOptions,
    cacheOption?: CaptchaCacheOptions
  ): Promise<{
    id: string;
    imageBase64: string;
  }> {
    // const { expirationTime, idPrefix } = this.captcha;
    const { type, ...others }: ImageCaptchaOptions = {
      ...this.captcha.default,
      ...this.captcha.image,
      ...options,
    };

    const { data, text } = svgCaptcha.create({
      ignoreChars: DEFAULT_IMAGE_IGNORE_CHARS[type] ?? '',
      ...others,
    });
    const id = await this.set(text, cacheOption);
    const imageBase64 = svgBase64(data);
    return { id, imageBase64 };
  }

  async formula(
    options?: FormulaCaptchaOptions,
    cacheOption?: CaptchaCacheOptions
  ): Promise<{
    id: string;
    imageBase64: string;
  }> {
    const formulaCaptchaOptions = {
      ...this.captcha.default,
      ...this.captcha.formula,
      ...options,
    };

    const { data, text } = svgCaptcha.createMathExpr(formulaCaptchaOptions);
    const id = await this.set(text, cacheOption);
    const imageBase64 = svgBase64(data);
    return { id, imageBase64 };
  }

  async text(
    options?: TextCaptchaOptions,
    cacheOption?: CaptchaCacheOptions
  ): Promise<{
    id: string;
    text: string;
  }> {
    const { type, ...textOptions }: TextCaptchaOptions = {
      ...this.captcha.default,
      ...this.captcha.text,
      ...options,
    };

    let chars = '';
    switch (type) {
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
    const id = await this.set(text, cacheOption);
    return { id, text };
  }

  async set(text: string, cacheOptions?: CaptchaCacheOptions): Promise<string> {
    const id = nanoid();
    await this.captchaCaching.set(
      this.getStoreId(id, cacheOptions),
      (text || '').toLowerCase(),
      (cacheOptions?.expirationTime ?? this.captcha.expirationTime) * 1000
    );
    return id;
  }

  async check(
    id: string,
    value: string,
    cacheOptions?: CaptchaCacheOptions
  ): Promise<boolean> {
    if (!id || !value) {
      return false;
    }
    const storeId = this.getStoreId(id, cacheOptions);
    const storedValue = await this.captchaCaching.get(storeId);
    if (value.toLowerCase() !== storedValue) {
      return false;
    }
    await this.captchaCaching.del(storeId);
    return true;
  }

  private getStoreId(id: string, cacheOptions?: CaptchaCacheOptions): string {
    const idPrefix = cacheOptions?.idPrefix ?? this.captcha.idPrefix;
    if (!idPrefix) {
      return id;
    }
    return `${idPrefix}:${id}`;
  }
}
