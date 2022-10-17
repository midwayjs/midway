import {
    Provide,
    Inject,
    Config,
    Scope,
    ScopeEnum
  } from '@midwayjs/core';
import { CacheManager } from '@midwayjs/cache';
import * as svgCaptcha from 'svg-captcha';
import * as svgBase64 from 'mini-svg-data-uri';
import { nanoid } from 'nanoid';
import { ImageVerificationCodeOptions, VerificationCodeOptions } from './interface';
@Provide()
@Scope(ScopeEnum.Singleton)
export class VerificationCodeService {
    @Inject()
    cacheManager: CacheManager;

    @Config('verificationCode')
    verificationCode: VerificationCodeOptions;

    async image(options?: ImageVerificationCodeOptions):Provide<{
        id: string;
        imageBase64: string;
    }> {
        const { width, height, type } = Object.assign({}, this.verificationCode.image, options);
        let ignoreChars = '';
        switch(type) {
            case 'letter':
                ignoreChars = '0123456789';
                break;
            case 'number':
                ignoreChars = 'abcdefghijklmnopqrstuvwxyz';
                ignoreChars += ignoreChars.toUpperCase();
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

    async set(text: string): Promise<string> {
        const id = nanoid();
        await this.cacheManager.set(
            this.getStoreId(id),
            text.toLowerCase(),
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
        if (value.toLowerCase()!== storedValue) {
            return false;
        }
        this.cacheManager.del(storeId);
        return true;
    }

    private getStoreId(id: string): string {
        return `${this.verificationCode}:${id}`
    }
}
  