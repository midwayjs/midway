import { join } from 'path';
import { existsSync } from 'fs';
export const findNpmModule = (cwd, modName) => {
  const modPath = join(cwd, 'node_modules', modName);
  if (existsSync(modPath)) {
    return modPath;
  }
  const parentCwd = join(cwd, '../');
  if (parentCwd !== cwd) {
    return findNpmModule(parentCwd, modName);
  }
};

export const output404 = (path, functionsMap) => {
  const allPathMap = {};
  Object.keys(functionsMap || {}).forEach(functionName => {
    const funcItem = functionsMap[functionName];
    if (!funcItem.events || !funcItem.events.length) {
      return;
    }
    funcItem.events.forEach(event => {
      if (!event) {
        return;
      }
      const http = event.http || event.apigw;
      if (http) {
        allPathMap[http.path || '/'] = {
          method: [].concat(http.method),
          functionName,
        };
      }
    });
  });
  const allPath = Object.keys(allPathMap);
  return `
    <div style="padding: 48px 24px 0 24px;font-size: 24px;color: #333;line-height: 24px;">404</div>
    <div style="padding: 0 24px;font-size: 14px;color: #666;line-height: 48px;">path '${path}' not found</div>
    ${
      process.env.NODE_ENV === 'local' && allPath.length
        ? `<div style="padding: 24px;font-size: 13px;line-height: 18px;">
      <div>You can visit:</div>
      ${allPath
        .map(path => {
          return `<a href="${path}">${path}</a>`;
        })
        .join('<br />')}</div>`
        : ''
    }
    <div style="border-top: 1px solid #eee;padding: 24px;font-size: 12px;color: #ccc;line-height: 36px;">© Midwayjs</div>
  `;
};

// 分析装饰器上面的函数信息
export const analysisDecorator = async (cwd: string) => {
  const midwayCoreMod = findNpmModule(cwd, '@midwayjs/core');
  const { ServerlessTriggerCollector } = require(midwayCoreMod);
  const collector = new ServerlessTriggerCollector();
  const result = await collector.getFunctionList();
  const allFunc = {};
  if (Array.isArray(result)) {
    result.forEach(func => {
      const handler = func.funcHandlerName;
      if (!handler) {
        return;
      }

      if (!func.functionTriggerMetadata) {
        func.functionTriggerMetadata = {};
      }

      const funcName =
        func.functionTriggerMetadata.functionName ||
        func.functionName ||
        handler.replace(/[^\w]/g, '-');
      if (!allFunc[funcName]) {
        allFunc[funcName] = {
          handler,
          events: [],
        };
      }

      if (!allFunc[funcName].events) {
        allFunc[funcName].events = [];
      }

      if (!allFunc[funcName].handler) {
        allFunc[funcName].handler = handler;
      }

      const trigger = func.functionTriggerName;
      let isAddToTrigger = false;
      const { path, method } = func.functionTriggerMetadata;
      func.functionTriggerMetadata.method = [].concat(method || []);
      // 避免重复路径创建多个trigger
      const httpTrigger =
        path &&
        allFunc[funcName].events.find(event => {
          return event.http?.path === path || event.apigw?.path === path;
        });
      if (httpTrigger) {
        httpTrigger.http.method = [].concat(httpTrigger.http.method || []);
        if (method) {
          [].concat(method).forEach(methodItem => {
            if (!httpTrigger.http.method.includes(methodItem)) {
              httpTrigger.http.method.push(methodItem);
            }
          });
        }
        isAddToTrigger = true;
      }

      if (!isAddToTrigger) {
        const triggerIsBoolean = !Object.keys(func.functionTriggerMetadata)
          .length;
        allFunc[funcName].events.push({
          [trigger]: triggerIsBoolean ? true : func.functionTriggerMetadata,
        });
      }
    });
  }


  if (Array.isArray(global['HOOKS_ROUTER'])) {
    for(const router of global['HOOKS_ROUTER']) {
      allFunc[router.functionId] = {
        handler: router.handler,
        events: [
          {
            [router.type]: router
          }
        ]
      }
    }
  }

  return allFunc;
};
