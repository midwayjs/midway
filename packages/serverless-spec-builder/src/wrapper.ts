import { join } from 'path';
import { writeFileSync, existsSync } from 'fs';
import { render } from 'ejs';
import { getLayers } from './utils';
export const wrapperContent = `const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('<%=starter %>');
<% layerDeps.forEach(function(layer){ %>const <%=layer.name%> = require('<%=layer.path%>');
<% }); %>

let starter;
let runtime;
let inited = false;

const initializeMethod = async (config = {}) => {
  runtime = await start({
    layers: [<%= layers.join(", ") %>]
  });
  starter = new FaaSStarter({ config, baseDir: __dirname });
  await starter.start();
  inited = true;
};

exports.initializer = asyncWrapper(async ({config} = {}) => {
  await initializeMethod(config);
});

<% handlers.forEach(function(handlerData){ %>
exports.<%=handlerData.name%> = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  <% if (handlerData.handler) { %>
  return runtime.asyncEvent(starter.handleInvokeWrapper('<%=handlerData.handler%>'))(...args);
  <% } else { %>
  const allHandlers = <%-JSON.stringify(handlerData.handlers)%>;
  return runtime.asyncEvent(async (ctx) => {
    let handler = null;
    let ctxPath = ctx && ctx.path || '';
    if (ctxPath) {
      handler = allHandlers.find(handler => {
        return ctxPath.indexOf(handler.path) != -1;
      });
    }

    if (!handler) {
      handler = allHandlers[allHandlers.length - 1];
    }

    if (handler) {
      return starter.handleInvokeWrapper(handler.handler)(ctx);
    }
    return 'unhandler path: ' + ctxPath + '; handlerInfo: ' + JSON.stringify(allHandlers);
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
}) {
  const { service, distDir, starter, baseDir, cover } = options;
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
    if (handlerConf._isAggregation && handlerConf.functions) {
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
    const layers = getLayers(
      service.layers,
      ...files[file].originLayers
    );
    const content = render(wrapperContent, {
      starter,
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
  return handlers.map(handler => {
    const path = handler.path.replace(/\**$/, '');
    return {
      handler: handler.handler,
      path,
      level: path.split('/').length - 1
    };
  }).sort((handlerA, handlerB) => {
    return handlerB.level - handlerA.level;
  });
}
