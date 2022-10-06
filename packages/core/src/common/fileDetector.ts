import {
  IFileDetector,
  IMidwayContainer,
  IObjectDefinition,
} from '../interface';
import { Types } from '../util/types';
import { run } from '@midwayjs/glob';
import { MidwayDuplicateClassNameError } from '../error';
import { DEFAULT_PATTERN, IGNORE_PATTERN } from '../constants';
import { getProviderName } from '../decorator';

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

export class DirectoryFileDetector extends AbstractFileDetector<{
  loadDir?: string | string[];
  pattern?: string | string[];
  ignore?: string | string[];
  namespace?: string;
  conflictCheck?: boolean;
}> {
  private duplicateModuleCheckSet = new Map();

  run(container) {
    const loadDirs = []
      .concat(this.options.loadDir || [])
      .concat(this.extraDetectorOptions.loadDir || []);

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
}

export class CustomModuleDetector extends AbstractFileDetector<{
  modules?: any[];
  namespace?: string;
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
