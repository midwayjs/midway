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
  return runtime.asyncEvent(async (ctx) => {
    <% handlerData.handlers.forEach(function(multiHandler){ %> if (ctx && ctx.path === '<%=multiHandler.path%>') {
      return starter.handleInvokeWrapper('<%=multiHandler.handler%>')(ctx);
    } else <% }); %>{
      return 'unhandler path: ' + (ctx && ctx.path || '');
    }
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
}) {
  const { service, distDir, starter, baseDir } = options;
  const files = {};
  const functions = service.functions || {};
  for (const func in functions) {
    const handlerConf = functions[func];
    if (handlerConf._ignore) {
      continue;
    }
    const [handlerFileName, name] = handlerConf.handler.split('.');
    if (existsSync(join(baseDir, handlerFileName + '.js'))) {
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
        handlers: handlerConf._handlers,
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
