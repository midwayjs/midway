import { MetadataManager } from '@midwayjs/core';
import { registry } from './registry';

export interface Dto<T> {
  new (): T;
}

/**
 * 从一个 DTO 类中选择指定的属性创建新的 DTO 类
 * @param dto 源 DTO 类
 * @param keys 要选择的属性名数组
 * @returns 新的 DTO 类，只包含选择的属性
 */
export function PickDto<T, K extends keyof T>(
  dto: Dto<T>,
  keys: K[]
): Dto<Pick<T, (typeof keys)[number]>> {
  const pickedDto: any = function () {};
  pickedDto.prototype = dto.prototype;
  MetadataManager.copyMetadata(dto, pickedDto, {
    metadataFilter: (_key: string, propertyName: string) => {
      // 如果没有属性名，说明是类级别的元数据，需要保留
      if (!propertyName) {
        return true;
      }
      // 对于属性级别的元数据，只保留选中的属性
      return keys.includes(propertyName as K);
    },
  });
  return pickedDto as Dto<Pick<T, (typeof keys)[number]>>;
}

/**
 * 从一个 DTO 类中排除指定的属性创建新的 DTO 类
 * @param dto 源 DTO 类
 * @param keys 要排除的属性名数组
 * @returns 新的 DTO 类，不包含被排除的属性
 */
export function OmitDto<T, K extends keyof T>(
  dto: Dto<T>,
  keys: K[]
): Dto<Omit<T, (typeof keys)[number]>> {
  const omittedDto: any = function () {};
  omittedDto.prototype = dto.prototype;
  MetadataManager.copyMetadata(dto, omittedDto, {
    metadataFilter: (_key: string, propertyName: string) => {
      // 如果没有属性名，说明是类级别的元数据，需要保留
      if (!propertyName) {
        return true;
      }
      // 对于属性级别的元数据，排除指定的属性
      return !keys.includes(propertyName as K);
    },
  });
  return omittedDto as Dto<Omit<T, (typeof keys)[number]>>;
}

/**
 * 将一个 DTO 类的所有属性转换为可选属性
 * @param dto 源 DTO 类
 * @returns 新的 DTO 类，所有属性都是可选的
 */
export function PartialDto<T>(dto: Dto<T>): Dto<Partial<T>> {
  const partialDto: any = function () {};
  partialDto.prototype = dto.prototype;

  // 复制所有元数据，不修改验证规则
  MetadataManager.copyMetadata(dto, partialDto);
  // 将属性级别的元数据转换为可选属性
  registry.getDefaultValidator().schemaHelper.setOptional(partialDto);

  return partialDto as Dto<Partial<T>>;
}

/**
 * 将一个 DTO 类的所有属性转换为必选属性
 * @param dto 源 DTO 类
 * @returns 新的 DTO 类，所有属性都是必选的
 */
export function RequiredDto<T>(dto: Dto<T>): Dto<Required<T>> {
  const requiredDto: any = function () {};
  requiredDto.prototype = dto.prototype;

  // 复制所有元数据，不修改验证规则
  MetadataManager.copyMetadata(dto, requiredDto);
  // 将属性级别的元数据转换为可选属性
  registry.getDefaultValidator().schemaHelper.setRequired(requiredDto);

  return requiredDto as Dto<Required<T>>;
}
