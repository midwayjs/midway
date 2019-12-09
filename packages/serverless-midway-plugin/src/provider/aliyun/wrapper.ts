export const wrapperContent = `const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('@midwayjs/serverless-fc-starter');
<% layerDeps.forEach(function(layer){ %>const <%=layer.name%> = require('<%=layer.path%>').default;
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
  return runtime.asyncEvent(starter.handleInvokeWrapper('<%=handlerData.handler%>'))(...args);
});
<% }); %>`;
