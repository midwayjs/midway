import 'reflect-metadata';
import { attachConstructorDataOnClass, attachMetaDataOnClass } from '../utils';
import {
  CONFIG_KEY_CLZ,
  CONFIG_KEY_PROP,
  LOGGER_KEY_CLZ,
  LOGGER_KEY_PROP,
  PLUGIN_KEY_CLZ,
  PLUGIN_KEY_PROP,
} from './metaKeys';

export function config(identifier?: string) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, 'config', index);
    } else {
      if (!identifier) {
        identifier = targetKey;
      }
      attachMetaDataOnClass(target, CONFIG_KEY_CLZ, targetKey);
      Reflect.defineMetadata(CONFIG_KEY_PROP, identifier, target, targetKey);
    }
  };
}

export function plugin(identifier?: string) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, 'plugin', index);
    } else {
      if (!identifier) {
        identifier = targetKey;
      }
      attachMetaDataOnClass(target, PLUGIN_KEY_CLZ, targetKey);
      Reflect.defineMetadata(PLUGIN_KEY_PROP, identifier, target, targetKey);
    }
  };
}

export function logger(identifier?: string) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, 'logger', index);
    } else {
      if (!identifier) {
        identifier = targetKey;
      }
      attachMetaDataOnClass(target, LOGGER_KEY_CLZ, targetKey);
      Reflect.defineMetadata(LOGGER_KEY_PROP, identifier, target, targetKey);
    }
  };
}
