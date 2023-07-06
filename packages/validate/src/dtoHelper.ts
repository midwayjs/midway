import { getClassExtendedMetadata, saveClassMetadata } from '@midwayjs/core';
import { RULES_KEY } from './constants';

export interface Dto<T> {
  new (): T;
}

export function PickDto<T, K extends keyof T>(
  dto: Dto<T>,
  keys: K[]
): Dto<Pick<T, (typeof keys)[number]>> {
  const pickedDto: any = function () {};
  pickedDto.prototype = dto.prototype;
  const fatherRule = getClassExtendedMetadata(RULES_KEY, dto);
  const pickedRule: any = {};
  for (const key of keys) {
    if (fatherRule[key]) {
      pickedRule[key] = fatherRule[key];
    }
  }
  saveClassMetadata(RULES_KEY, pickedRule, pickedDto);
  return pickedDto as Dto<Pick<T, (typeof keys)[number]>>;
}

export function OmitDto<T, K extends keyof T>(
  dto: Dto<T>,
  keys: K[]
): Dto<Omit<T, (typeof keys)[number]>> {
  const pickedDto: any = function () {};
  pickedDto.prototype = dto.prototype;
  const fatherRule = getClassExtendedMetadata(RULES_KEY, dto);
  const pickedRule: any = Object.assign({}, fatherRule);
  for (const key of keys) {
    delete pickedRule[key];
  }
  saveClassMetadata(RULES_KEY, pickedRule, pickedDto);
  return pickedDto as Dto<Omit<T, (typeof keys)[number]>>;
}
