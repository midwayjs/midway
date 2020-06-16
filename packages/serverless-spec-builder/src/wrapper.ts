import { join } from 'path';
import { writeFileSync, existsSync } from 'fs';
import { render } from 'ejs';
import { getLayers } from './utils';
export const wrapperContent = `const { FaaSStarter } = require('<%=faasModName %>');
const { asyncWrapper, start } = require('<%=starter %>');
<% layerDeps.forEach(function(layer){ %>const <%=layer.name%> = require('<%=layer.path%>');
<% }); %>

let starter;
let runtime;
let inited = false;

const initializeMethod = async (initializeContext = {}) => {
  runtime = await start({
    layers: [<%= layers.join(", ") %>]
  });
  starter = new FaaSStarter({ baseDir: __dirname, initializeContext, applicationAdapter: runtime });
  <% loadDirectory.forEach(function(dirName){ %>
  starter.loader.loadDirectory({ baseDir: '<%=dirName%>'});<% }) %>
  await starter.start();
  inited = true;
};

exports.initializer = asyncWrapper(async (...args) => {
  await initializeMethod(...args);
});

<% handlers.forEach(function(handlerData){ %>
exports.<%=handlerData.name%> = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  <% if (handlerData.handler) { %>
  return runtime.asyncEvent(starter.handleInvokeWrapper('<%=handlerData.handler%>'))(...args);
  <% } else { %>
  const picomatch = require('picomatch');
  const allHandlers = <%-JSON.stringify(handlerData.handlers)%>;
  return runtime.asyncEvent(async (ctx) => {
    let handler = null;
    let ctxPath = ctx && ctx.path || '';
    if (ctxPath) {
      handler = allHandlers.find(handler => {
        return picomatch.isMatch(ctxPath, handler.router)
      });
    }

    if (handler) {
      return starter.handleInvokeWrapper(handler.handler)(ctx);
    }
    ctx.status = 404;
    ctx.set('Content-Type', 'text/html');
    return '<h1>404 Page Not Found</h1><hr />Request path: ' + ctxPath + '<hr /><div style="font-size: 12px;color: #999999;">Powered by <a href="https://github.com/midwayjs/midway-faas">Midway</a></div>';
  })(...args);
  <% } %>
});
<% }); %>`;

// 写入口
export function writeWrapper(options: {
  service: any;
  baseDir: string;
  distDir: string;
  starter: string;
  cover?: boolean;
  loadDirectory?: string[];
  faasModName?: string;
}) {
  const {
    service,
    distDir,
    starter,
    baseDir,
    cover,
    faasModName,
    loadDirectory = [],
  } = options;
  const files = {};
  const functions = service.functions || {};
  for (const func in functions) {
    const handlerConf = functions[func];
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

  for (const file in files) {
    const fileName = join(distDir, `${file}.js`);
    const layers = getLayers(service.layers, ...files[file].originLayers);
    const content = render(wrapperContent, {
      starter,
      faasModName: faasModName || '@midwayjs/faas',
      loadDirectory,
      handlers: files[file].handlers,
      ...layers,
    });
    writeFileSync(fileName, content);
  }
}

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
      if (handlerA.pureRouter === handlerB.pureRouter) {
        return handlerA.router.length - handlerB.router.length;
      }
      return handlerB.level - handlerA.level;
    });
}
