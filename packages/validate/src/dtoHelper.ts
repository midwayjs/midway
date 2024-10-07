import { MetadataManager } from '@midwayjs/core';
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
  MetadataManager.copyMetadata(dto, pickedDto, {
    metadataFilter: (key: string, propertyName: string) => {
      return key === RULES_KEY && keys.includes(propertyName as K);
    },
  });
  return pickedDto as Dto<Pick<T, (typeof keys)[number]>>;
}

export function OmitDto<T, K extends keyof T>(
  dto: Dto<T>,
  keys: K[]
): Dto<Omit<T, (typeof keys)[number]>> {
  const pickedDto: any = function () {};
  pickedDto.prototype = dto.prototype;
  MetadataManager.copyMetadata(dto, pickedDto, {
    metadataFilter: (key: string, propertyName: string) => {
      return key === RULES_KEY && !keys.includes(propertyName as K);
    },
  });
  return pickedDto as Dto<Omit<T, (typeof keys)[number]>>;
}
