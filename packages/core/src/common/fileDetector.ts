import {
  IFileDetector,
  IMidwayContainer,
  IObjectDefinition,
} from '../interface';
import { Types } from '../util/types';
import { run } from '@midwayjs/glob';
import { MidwayDuplicateClassNameError } from '../error';
import { DEFAULT_PATTERN, IGNORE_PATTERN } from '../constants';
import { loadModule } from '../util';
import { DecoratorManager } from '../decorator';

export abstract class AbstractFileDetector<T> implements IFileDetector {
  options: T;
  extraDetectorOptions: T;
  constructor(options?: T) {
    this.options = options;
    this.extraDetectorOptions = {} as T;
  }

  abstract run(container: IMidwayContainer): void | Promise<void>;

  setExtraDetectorOptions(detectorOptions: T) {
    this.extraDetectorOptions = detectorOptions;
  }
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
  namespace?: string;
  conflictCheck?: boolean;
}> {
  private duplicateModuleCheckSet = new Map();

  run(container) {
    if (this.getType() === 'commonjs') {
      return this.loadSync(container);
    } else {
      return this.loadAsync(container);
    }
  }

  loadSync(container) {
    this.options = this.options || {};
    const loadDirs = [].concat(
      this.options.loadDir ?? container.get('baseDir')
    );

    for (const dir of loadDirs) {
      const fileResults = run(
        DEFAULT_GLOB_PATTERN.concat(this.options.pattern || []).concat(
          this.extraDetectorOptions.pattern || []
        ),
        {
          cwd: dir,
          ignore: DEFAULT_IGNORE_PATTERN.concat(
            this.options.ignore || []
          ).concat(this.extraDetectorOptions.ignore || []),
        }
      );

      // 检查重复模块
      const checkDuplicatedHandler = (module, options?: IObjectDefinition) => {
        if (
          (this.options.conflictCheck ||
            this.extraDetectorOptions.conflictCheck) &&
          Types.isClass(module)
        ) {
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
          namespace: this.options.namespace,
          srcPath: file,
          createFrom: 'file',
          bindHook: checkDuplicatedHandler,
        });
      }
    }

    // check end
    this.duplicateModuleCheckSet.clear();
  }

  async loadAsync(container) {
    this.options = this.options || {};
    const loadDirs = [].concat(
      this.options.loadDir ?? container.get('baseDir')
    );

    for (const dir of loadDirs) {
      const fileResults = run(
        DEFAULT_GLOB_PATTERN.concat(this.options.pattern || []).concat(
          this.extraDetectorOptions.pattern || []
        ),
        {
          cwd: dir,
          ignore: DEFAULT_IGNORE_PATTERN.concat(
            this.options.ignore || []
          ).concat(this.extraDetectorOptions.ignore || []),
        }
      );

      // 检查重复模块
      const checkDuplicatedHandler = (module, options?: IObjectDefinition) => {
        if (
          (this.options.conflictCheck ||
            this.extraDetectorOptions.conflictCheck) &&
          Types.isClass(module)
        ) {
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
          namespace: this.options.namespace,
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
  async run(container) {
    for (const module of this.options.modules) {
      container.bindClass(module, {
        namespace: this.options.namespace,
        createFrom: 'module',
      });
    }
  }
}
