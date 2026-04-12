import {
  IFileDetector,
  IMidwayGlobalContainer,
  IObjectDefinition,
} from '../interface';
import { Types } from '../util/types';
import { run } from '@midwayjs/glob';
import { MidwayDuplicateClassNameError } from '../error';
import {
  DEFAULT_PATTERN,
  IGNORE_PATTERN,
  MODULE_LOADER_KEY,
} from '../constants';
import { loadModule } from '../util';
import { DecoratorManager } from '../decorator';
import { debuglog } from 'util';
import { resolve } from 'path';
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
  importQuery?: boolean | string | (() => string);
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
    // When mock injects a dev-only source loader, detector scans must reuse it
    // instead of falling back to the generic core loader.
    const moduleLoader: typeof loadModule = container.hasObject(
      MODULE_LOADER_KEY
    )
      ? container.getObject(MODULE_LOADER_KEY)
      : loadModule;
    const loadDirs = [].concat(
      this.options.loadDir ?? container.get('baseDir')
    );
    let importQuery: string | undefined;
    const envImportQueryEnabled = process.env.MIDWAY_HMR_IMPORT_QUERY === '1';
    const envImportQueryFile = process.env.MIDWAY_HMR_IMPORT_QUERY_FILE;
    if (typeof this.options.importQuery === 'function') {
      importQuery = this.options.importQuery();
    } else if (typeof this.options.importQuery === 'string') {
      importQuery = this.options.importQuery;
    } else if (this.options.importQuery) {
      importQuery = `${Date.now()}_${Math.random()}`;
    } else if (envImportQueryEnabled && !envImportQueryFile) {
      importQuery = `${Date.now()}_${Math.random()}`;
    }

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
        let currentImportQuery = importQuery;
        if (
          !this.options.importQuery &&
          envImportQueryEnabled &&
          envImportQueryFile
        ) {
          currentImportQuery =
            resolve(file) === resolve(envImportQueryFile)
              ? `${Date.now()}_${Math.random()}`
              : undefined;
        }
        const exports = await moduleLoader(file, {
          loadMode: 'esm',
          importQuery: currentImportQuery,
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
