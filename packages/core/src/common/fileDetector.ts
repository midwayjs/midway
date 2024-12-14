import {
  IFileDetector,
  IMidwayGlobalContainer,
  IObjectDefinition,
} from '../interface';
import { Types } from '../util/types';
import { run } from '@midwayjs/glob';
import { MidwayDuplicateClassNameError } from '../error';
import { DEFAULT_PATTERN, IGNORE_PATTERN } from '../constants';
import { loadModule } from '../util';
import { DecoratorManager } from '../decorator';
import { debuglog } from 'util';
const debug = debuglog('midway:debug');

export abstract class AbstractFileDetector<T> implements IFileDetector {
  options: T;
  constructor(options?: T) {
    this.options = options;
  }

  abstract run(
    container: IMidwayGlobalContainer,
    namespace: string
  ): Promise<void>;

  abstract runSync(container: IMidwayGlobalContainer, namespace: string): void;
}

const DEFAULT_GLOB_PATTERN = ['**/**.tsx'].concat(DEFAULT_PATTERN);
const DEFAULT_IGNORE_PATTERN = [
  '**/logs/**',
  '**/run/**',
  '**/public/**',
  '**/app/view/**',
  '**/app/views/**',
  '**/app/extend/**',
  '**/node_modules/**',
  '**/**.test.ts',
  '**/**.test.js',
  '**/__test__/**',
].concat(IGNORE_PATTERN);

/**
 * CommonJS module loader
 */
export class CommonJSFileDetector extends AbstractFileDetector<{
  loadDir?: string | string[];
  pattern?: string | string[];
  ignore?: string | string[];
  conflictCheck?: boolean;
}> {
  private duplicateModuleCheckSet = new Map();

  async run(container: IMidwayGlobalContainer, namespace: string) {
    if (this.getType() === 'commonjs') {
      return this.loadSync(container, namespace);
    } else {
      return this.loadAsync(container, namespace);
    }
  }

  loadSync(container: IMidwayGlobalContainer, namespace: string) {
    this.options = this.options || {};
    const loadDirs = [].concat(
      this.options.loadDir ?? container.get('baseDir')
    );

    for (const dir of loadDirs) {
      const fileResults = run(
        DEFAULT_GLOB_PATTERN.concat(this.options.pattern || []),
        {
          cwd: dir,
          ignore: DEFAULT_IGNORE_PATTERN.concat(this.options.ignore || []),
        }
      );

      debug(`[core]: load file from ${dir}, files: ${fileResults}`);

      // 检查重复模块
      const checkDuplicatedHandler = (module, options?: IObjectDefinition) => {
        if (this.options.conflictCheck && Types.isClass(module)) {
          const name = DecoratorManager.getProviderName(module);
          if (name) {
            if (this.duplicateModuleCheckSet.has(name)) {
              throw new MidwayDuplicateClassNameError(
                name,
                options.srcPath,
                this.duplicateModuleCheckSet.get(name)
              );
            } else {
              this.duplicateModuleCheckSet.set(name, options.srcPath);
            }
          }
        }
      };

      for (const file of fileResults) {
        const exports = require(file);
        // add module to set
        container.bindClass(exports, {
          namespace,
          srcPath: file,
          createFrom: 'file',
          bindHook: checkDuplicatedHandler,
        });
      }
    }

    // check end
    this.duplicateModuleCheckSet.clear();
  }

  async loadAsync(container: IMidwayGlobalContainer, namespace: string) {
    this.options = this.options || {};
    const loadDirs = [].concat(
      this.options.loadDir ?? container.get('baseDir')
    );

    for (const dir of loadDirs) {
      const fileResults = run(
        DEFAULT_GLOB_PATTERN.concat(this.options.pattern || []),
        {
          cwd: dir,
          ignore: DEFAULT_IGNORE_PATTERN.concat(this.options.ignore || []),
        }
      );

      debug(`[core]: load file from ${dir}, files: ${fileResults}`);

      // 检查重复模块
      const checkDuplicatedHandler = (module, options?: IObjectDefinition) => {
        if (this.options.conflictCheck && Types.isClass(module)) {
          const name = DecoratorManager.getProviderName(module);
          if (name) {
            if (this.duplicateModuleCheckSet.has(name)) {
              throw new MidwayDuplicateClassNameError(
                name,
                options.srcPath,
                this.duplicateModuleCheckSet.get(name)
              );
            } else {
              this.duplicateModuleCheckSet.set(name, options.srcPath);
            }
          }
        }
      };

      for (const file of fileResults) {
        const exports = await loadModule(file, {
          loadMode: 'esm',
        });
        // add module to set
        container.bindClass(exports, {
          namespace,
          srcPath: file,
          createFrom: 'file',
          bindHook: checkDuplicatedHandler,
        });
      }
    }

    // check end
    this.duplicateModuleCheckSet.clear();
  }

  getType(): 'commonjs' | 'module' {
    return 'commonjs';
  }

  runSync(container: IMidwayGlobalContainer, namespace: string): void {
    if (this.getType() === 'commonjs') {
      return this.loadSync(container, namespace);
    }
  }
}

/**
 * ES module loader
 */
export class ESModuleFileDetector extends CommonJSFileDetector {
  getType(): 'commonjs' | 'module' {
    return 'module';
  }
}

export class CustomModuleDetector extends AbstractFileDetector<{
  modules?: any[];
  namespace?: string;
}> {
  async run(container: IMidwayGlobalContainer) {
    this.runSync(container, this.options.namespace);
  }

  runSync(container: IMidwayGlobalContainer, namespace: string): void {
    for (const module of this.options.modules) {
      container.bindClass(module, {
        namespace: this.options.namespace,
        createFrom: 'module',
      });
    }
  }
}
