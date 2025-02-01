import { MidwayContainer } from './container';
import {
  ClassType,
  IObjectDefinition,
  ModuleLoadType,
  ObjectIdentifier,
} from '../interface';
import { MidwayEnvironmentService } from '../service/environmentService';
import { loadModule } from '../util';
import { Types } from '../util/types';
import { DecoratorManager, MAIN_MODULE_KEY } from '../decorator';
import { debuglog } from 'util';
const debug = debuglog('midway:container');

/**
 * 尝试用于开发时动态更新的 IoC 容器
 */
export class DynamicMidwayContainer extends MidwayContainer {
  private moduleType: ModuleLoadType;
  private modifyClassMapping = new Map<string, string>();

  async updateDefinition(modifyFilePath: string, newId: string) {
    debug('updateDefinition %s', modifyFilePath);
    if (!this.moduleType) {
      const environmentService = await this.getAsync(MidwayEnvironmentService);
      this.moduleType = environmentService.getModuleLoadType();
    }

    // 根据文件路径找到老的类
    const oldDefinitionList = this.findDefinitionByPath(modifyFilePath);

    debug('oldDefinitionList size %s', oldDefinitionList.length);

    if (!oldDefinitionList.length) {
      return;
    }

    // 一个文件可能对应多个不同的 ObjectDefinition，但是导出的类名可能是不同的，所以可以使用类名作为 key
    const nameList = {};
    // 拿到旧的标识符
    for (const oldDefinition of oldDefinitionList) {
      nameList[oldDefinition.name] = oldDefinition.id;
    }

    debug('nameList %j', nameList);

    // 清除 require cache
    this.findRequireCacheAndClear(modifyFilePath);

    // 清理历史 context 缓存
    for (const oldDefinition of oldDefinitionList) {
      this.removeObject(oldDefinition.id);
    }

    debug('ready to load module %s', modifyFilePath);

    // 重新加载新的文件
    const modLoaded = await loadModule(modifyFilePath, {
      loadMode: this.moduleType,
    });

    const newClassList = [];
    if (Types.isClass(modLoaded) || Types.isFunction(modLoaded)) {
      newClassList.push(modLoaded);
    } else {
      for (const m in modLoaded) {
        const module = modLoaded[m];
        newClassList.push(module);
      }
    }

    debug('newClassList size %s', newClassList.length);

    if (Types.isClass(modLoaded) || Types.isFunction(modLoaded)) {
      const newId = DecoratorManager.getProviderUUId(modLoaded);
      const name = DecoratorManager.getProviderName(modLoaded);
      if (nameList[name]) {
        debug('find old class name %s and will be remapping', name);
        this.remapping(nameList[name], newId);
      }

      debug('bindModule %s', newId);
      this.bindModule(modLoaded, {
        namespace: MAIN_MODULE_KEY,
        srcPath: modifyFilePath,
        createFrom: 'file',
      });
    } else {
      for (const m in modLoaded) {
        const module = modLoaded[m];
        if (Types.isClass(module) || Types.isFunction(module)) {
          const newId = DecoratorManager.getProviderUUId(module);
          const name = DecoratorManager.getProviderName(module);
          if (nameList[name] !== newId) {
            if (nameList[name]) {
              debug('find old class name %s and will be remapping', name);
              this.remapping(nameList[name], newId);
            }

            debug('bindModule %s', newId);
            this.bindModule(module, {
              namespace: MAIN_MODULE_KEY,
              srcPath: modifyFilePath,
              createFrom: 'file',
            });
          }
        }
      }
    }
  }

  getIdentifier(identifier: ClassType | string): string {
    // 从老的 id 映射成新的 id
    let name = 'unknown';
    if (typeof identifier !== 'string') {
      name = DecoratorManager.getProviderName(identifier);
      identifier = DecoratorManager.getProviderUUId(identifier);
    }

    debug('check identifier from %s %s', name, identifier);

    if (this.modifyClassMapping.has(identifier)) {
      debug('getIdentifier from modifyClassMapping %s -> %s', identifier, this.modifyClassMapping.get(identifier));
      return this.modifyClassMapping.get(identifier);
    }
    return identifier;
  }

  private findDefinitionByPath(filePath: string): IObjectDefinition[] {
    const results = [];
    // 遍历 registry
    for (const definition of (
      this.registry as unknown as Map<ObjectIdentifier, IObjectDefinition>
    ).values()) {
      if (definition.srcPath === filePath) {
        results.push(definition);
      }
    }
    return results;
  }

  private findRequireCacheAndClear(absolutePath: string) {
    const cacheKey = require.resolve(absolutePath);
    const cache = require.cache[cacheKey];
    if (cache) {
      debug('clear cache %s', cacheKey);
      delete require.cache[cacheKey];
    }
  }

  private remapping(oldId, newId) {
    // 新老 id 做个重新映射，如果第一次 1 -> 2， 第二次输入 2 -> 3，那么要变成 1 -> 3
    for (const [key, value] of this.modifyClassMapping.entries()) {
      if (value === oldId) {
        debug('remapping key = %s, %s -> %s', key, oldId, newId);
        // Update the mapping to the new newId
        this.modifyClassMapping.set(key, newId);
      }
    }

    debug('new remapping key = %s, value = %s', oldId, newId);
    // Set the new mapping
    this.modifyClassMapping.set(oldId, newId);
  }
}
