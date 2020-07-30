import { join, resolve } from 'path';
import { writeFileSync, existsSync, readFileSync, copyFileSync } from 'fs';
import { render } from 'ejs';
import { getLayers } from './utils';
// 写入口
export function writeWrapper(options: {
  service: any;
  baseDir: string;
  distDir: string;
  starter: string;
  cover?: boolean;
  loadDirectory?: string[];
  initializeName?: string; // default is initializer
  faasModName?: string; // default is '@midwayjs/faas'
  advancePreventMultiInit?: boolean;
  faasStarterName?: string; // default is FaaSStarter
  middleware?: string[]; // middleware
}) {
  const {
    service,
    distDir,
    starter,
    baseDir,
    cover,
    faasModName,
    initializeName,
    advancePreventMultiInit,
    loadDirectory = [],
    faasStarterName,
    middleware,
  } = options;
  const files = {};

  // for function programing，function
  let functionMap: any;
  const functions = service.functions || {};
  for (const func in functions) {
    const handlerConf = functions[func];

    // for fp
    functionMap = assignToFunctionMap(functionMap, handlerConf);
    // for aggregation fp
    if (handlerConf._handlers) {
      handlerConf._handlers.forEach(innerHandlerConf => {
        functionMap = assignToFunctionMap(functionMap, innerHandlerConf);
      });
    }

    if (handlerConf._ignore) {
      continue;
    }
    const [handlerFileName, name] = handlerConf.handler.split('.');
    if (!cover && existsSync(join(baseDir, handlerFileName + '.js'))) {
      // 如果入口文件名存在，则跳过
      continue;
    }
    if (!files[handlerFileName]) {
      files[handlerFileName] = {
        handlers: [],
        originLayers: [],
      };
    }
    if (handlerConf.layers && handlerConf.layers.length) {
      files[handlerFileName].originLayers.push(handlerConf.layers);
    }
    // 高密度部署
    if (handlerConf._isAggregation) {
      files[handlerFileName].handlers.push({
        name,
        handlers: formetAggregationHandlers(handlerConf._handlers),
      });
    } else {
      files[handlerFileName].handlers.push({
        name,
        handler: handlerConf.handler,
      });
    }
  }

  const isCustomAppType = !!service?.deployType;

  const tpl = readFileSync(
    resolve(
      __dirname,
      isCustomAppType ? '../wrapper_app.ejs' : '../wrapper.ejs'
    )
  ).toString();

  if (functionMap?.functionList?.length) {
    const registerFunctionFile = join(distDir, 'registerFunction.js');
    const sourceFile = resolve(__dirname, '../registerFunction.js');
    if (!existsSync(registerFunctionFile) && existsSync(sourceFile)) {
      copyFileSync(sourceFile, registerFunctionFile);
    }
  }

  for (const file in files) {
    const fileName = join(distDir, `${file}.js`);
    const layers = getLayers(service.layers, ...files[file].originLayers);
    const content = render(tpl, {
      starter,
      faasModName: faasModName || '@midwayjs/faas',
      loadDirectory,
      // Todo: future need remove middleware, use egg
      middleware: middleware || [],
      faasStarterName: faasStarterName || 'FaaSStarter',
      advancePreventMultiInit: advancePreventMultiInit || false,
      initializer: initializeName || 'initializer',
      handlers: files[file].handlers,
      functionMap,
      ...layers,
    });
    if (existsSync(fileName)) {
      const oldContent = readFileSync(fileName).toString();
      if (oldContent === content) {
        continue;
      }
    }
    writeFileSync(fileName, content);
  }
}

const assignToFunctionMap = (functionMap, handlerConf) => {
  if (handlerConf.isFunctional) {
    if (!functionMap?.functionList) {
      functionMap = { functionList: [] };
    }
    functionMap.functionList.push({
      functionName: handlerConf.exportFunction,
      functionHandler: handlerConf.handler,
      functionFilePath: handlerConf.sourceFilePath,
      argsPath: handlerConf.argsPath,
    });
  }
  return functionMap;
};

export function formetAggregationHandlers(handlers) {
  if (!handlers || !handlers.length) {
    return [];
  }
  return handlers
    .map(handler => {
      return {
        handler: handler.handler,
        router: handler.path.replace(/\*/g, '**'), // picomatch use **
        pureRouter: handler.path.replace(/\**$/, ''),
        level: handler.path.split('/').length - 1,
      };
    })
    .sort((handlerA, handlerB) => {
      if (handlerA.level === handlerB.level) {
        if (handlerB.pureRouter === handlerA.pureRouter) {
          return handlerA.router.length - handlerB.router.length;
        }
        return handlerB.pureRouter.length - handlerA.pureRouter.length;
      }
      return handlerB.level - handlerA.level;
    });
}
