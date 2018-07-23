import {Container, IContainer, TagClsMetadata, TAGGED_CLS} from 'midway-context';
import {FUNCTION_INJECT_KEY} from './decorators/metaKeys';

const globby = require('globby');
const path = require('path');
const camelcase = require('camelcase');
const is = require('is-type-of');
const debug = require('debug')('midway:container');

export class MidwayContainer extends Container implements IContainer {

  load(opts: {
    loadDir: string | string[],
  }) {
    const loadDirs = [].concat(opts.loadDir);

    for (let dir of loadDirs) {
      let fileResults = globby.sync(['**/**.ts', '**/**.js', '!**/**.d.ts'], {
        cwd: dir,
        ignore: ['**/node_modules/**', '**/logs/**', '**/run/**', '**/public/**', '**/view/**', '**/views/**'],
      });

      for (let name of fileResults) {
        const file = path.join(dir, name);
        debug(`binding file => ${file}`);
        let exports = require(file);

        if (is.class(exports) || is.function(exports)) {
          this.bindClass(exports);
        } else {
          for (let m in exports) {
            const module = exports[m];
            if (is.class(module) || is.function(module)) {
              this.bindClass(module);
            }
          }
        }
      }
    }
  }

  private bindClass(module) {
    if(is.class(module)) {
      let metaData = <TagClsMetadata>Reflect.getMetadata(TAGGED_CLS, module);
      if (metaData) {
        this.bind(metaData.id, module);
      } else {
        // inject by name in js
        this.bind(camelcase(module.name), module);
      }
    } else {
      let id = module[FUNCTION_INJECT_KEY];
      if(id) {
        this.bind(id, module);
      }
    }
  }

  registerCustomBinding(objectDefinition, target: any) {
    super.registerCustomBinding(objectDefinition, target);
  }

  createChild(): IContainer {
    const child = new MidwayContainer();
    child.parent = this;
    return child;
  }
}
