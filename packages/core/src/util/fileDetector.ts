import {
  IFileDetector,
  IFileDetectorOptions,
  IMidwayContainer,
} from '../interface';
import { isRegExp, ResolveFilter } from '@midwayjs/decorator';
import { run } from '@midwayjs/glob';

export abstract class AbstractFileDetector<T> implements IFileDetector {
  options: T;
  constructor(options) {
    this.options = options;
  }

  abstract run(container: IMidwayContainer);
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

export class DirectoryFileDetector extends AbstractFileDetector<IFileDetectorOptions> {
  private directoryFilterArray: ResolveFilter[] = [];

  run(container) {
    const debugLogger = container.getDebugLogger();
    const loadDirs = [].concat(this.options.loadDir || []);

    for (const dir of loadDirs) {
      const fileResults = run(
        DEFAULT_PATTERN.concat(this.options.pattern || []),
        {
          cwd: dir,
          ignore: DEFAULT_IGNORE_PATTERN.concat(this.options.ignore || []),
        }
      );

      for (const file of fileResults) {
        debugLogger(`\nmain:*********** binding "${file}" ***********`);
        debugLogger(`  namespace => "${this.options.namespace}"`);

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
            } else if (isRegExp(resolveFilter.pattern)) {
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
            container.bindClass(exports, this.options.namespace, file);
            debugLogger(`  binding "${file}" end`);
          }
        } else {
          const exports = require(file);
          // add module to set
          container.bindClass(exports, this.options.namespace, file);
          debugLogger(`  binding "${file}" end`);
        }
      }
    }
  }
}
