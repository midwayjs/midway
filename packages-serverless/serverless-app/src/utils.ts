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
      allPath.length
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
  const { WebRouterCollector } = require(midwayCoreMod);
  const collector = new WebRouterCollector();
  const result = await collector.getFlattenRouterTable();
  const allFunc = {};
  if (Array.isArray(result)) {
    result.forEach(func => {
      allFunc[func.funcHandlerName] = {
        handler: func.funcHandlerName,
        events: [
          {
            http: {
              method: [].concat(func.requestMethod || 'get'),
              path: (func.prefix + func.url).replace(/\/{1,}/g, '/'),
            }
          }
        ]
      }
    });
  }
  return allFunc;
};
