import {
  IFileDetector,
  IMidwayContainer,
  IObjectDefinition,
} from '../interface';
import { Types, ResolveFilter, getProviderName } from '@midwayjs/decorator';
import { run } from '@midwayjs/glob';
import { MidwayDuplicateClassNameError } from '../error';

export abstract class AbstractFileDetector<T> implements IFileDetector {
  options: T;
  extraDetectorOptions: T;
  constructor(options) {
    this.options = options;
    this.extraDetectorOptions = {} as T;
  }

  abstract run(container: IMidwayContainer);

  setExtraDetectorOptions(detectorOptions: T) {
    this.extraDetectorOptions = detectorOptions;
  }
}

const DEFAULT_PATTERN = ['**/**.ts', '**/**.tsx', '**/**.js'];
const DEFAULT_IGNORE_PATTERN = [
  '**/**.d.ts',
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
];

export class DirectoryFileDetector extends AbstractFileDetector<{
  loadDir: string | string[];
  pattern: string | string[];
  ignore: string | string[];
  namespace: string;
}> {
  private directoryFilterArray: ResolveFilter[] = [];
  private duplicateModuleCheckSet = new Map();

  run(container) {
    const loadDirs = []
      .concat(this.options.loadDir || [])
      .concat(this.extraDetectorOptions.loadDir || []);

    for (const dir of loadDirs) {
      const fileResults = run(
        DEFAULT_PATTERN.concat(this.options.pattern || []).concat(
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
        if (Types.isClass(module)) {
          const name = getProviderName(module);
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
        if (this.directoryFilterArray.length) {
          for (const resolveFilter of this.directoryFilterArray) {
            if (typeof resolveFilter.pattern === 'string') {
              if (file.includes(resolveFilter.pattern)) {
                const exports = resolveFilter.ignoreRequire
                  ? undefined
                  : require(file);
                resolveFilter.filter(exports, file, this);
                continue;
              }
            } else if (Types.isRegExp(resolveFilter.pattern)) {
              if ((resolveFilter.pattern as RegExp).test(file)) {
                const exports = resolveFilter.ignoreRequire
                  ? undefined
                  : require(file);
                resolveFilter.filter(exports, file, this);
                continue;
              }
            }

            const exports = require(file);
            // add module to set
            container.bindClass(exports, {
              namespace: this.options.namespace,
              srcPath: file,
              createFrom: 'file',
              bindHook: checkDuplicatedHandler,
            });
          }
        } else {
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
    }

    // check end
    this.duplicateModuleCheckSet.clear();
  }
}

export class CustomModuleDetector extends AbstractFileDetector<{
  modules: any[];
  namespace: string;
}> {
  run(container) {
    for (const module of this.options.modules) {
      container.bindClass(module, {
        namespace: this.options.namespace,
        createFrom: 'module',
      });
    }
  }
}
