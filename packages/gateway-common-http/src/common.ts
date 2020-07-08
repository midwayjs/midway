import { DevPackOptions, InvokeOptions } from '@midwayjs/gateway-common-core';
import { isMatch } from 'picomatch';
import * as qs from 'querystring';
import { getFuncList } from '@midwayjs/serverless-invoke';
const ignoreWildcardFunctionsWhiteList = [];

export async function parseInvokeOptionsByOriginUrl(
  options: DevPackOptions,
  req
): Promise<Partial<InvokeOptions>> {
  const ignorePattern = options.ignorePattern;
  const currentUrl = req.path || req.url;
  const currentMethod = req.method;
  if (ignorePattern) {
    if (typeof ignorePattern === 'function') {
      if (ignorePattern(req)) {
        return {};
      }
    } else if (ignorePattern.length) {
      for (const pattern of ignorePattern as string[]) {
        if (new RegExp(pattern).test(currentUrl)) {
          return {};
        }
      }
    }
  }
  const invokeOptions: Partial<InvokeOptions> = {};
  invokeOptions.functionDir = options.functionDir;
  invokeOptions.sourceDir = options.sourceDir;
  invokeOptions.verbose = options.verbose;
  const functions = await getFuncList({
    functionDir: options.functionDir,
    sourceDir: options.sourceDir,
  });
  const invokeHTTPData: Partial<{
    headers: object;
    body: string;
    method: string;
    path: string;
    query: object;
    base64Encoded: boolean;
  }> = {};
  // 获取路由
  let urlMatchList = [];
  Object.keys(functions).forEach(functionName => {
    const functionItem = functions[functionName] || {};
    const httpEvents = (functionItem.events || []).filter((eventItem: any) => {
      return eventItem.http || eventItem.apigw;
    });

    for (const event of httpEvents) {
      const eventItem = event?.http || event?.apigw;
      if (eventItem) {
        urlMatchList.push({
          functionName,
          originRouter: eventItem.path || '/*',
          router: eventItem.path?.replace(/\/\*$/, '/**') || '/**',
          method: (eventItem.method ? [].concat(eventItem.method) : []).map(
            method => {
              return method.toLowerCase();
            }
          ),
        });
      }
    }
  });
  // 1. 绝对路径规则优先级最高如 /ab/cb/e
  // 2. 星号只能出现最后且必须在/后面，如 /ab/cb/**
  // 3. 如果绝对路径和通配都能匹配一个路径时，绝对规则优先级高
  // 4. 有多个通配能匹配一个路径时，最长的规则匹配，如 /ab/** 和 /ab/cd/** 在匹配 /ab/cd/f 时命中 /ab/cd/**
  // 5. 如果 / 与 /* 都能匹配 / ,但 / 的优先级高于 /*
  urlMatchList = urlMatchList
    .map(item => {
      return {
        functionName: item.functionName,
        router: item.router,
        pureRouter: item.router.replace(/\**$/, ''),
        originRouter: item.originRouter,
        level: item.router.split('/').length - 1,
        method: item.method,
      };
    })
    .sort((handlerA, handlerB) => {
      if (handlerA.pureRouter === handlerB.pureRouter) {
        return handlerA.router.length - handlerB.router.length;
      }
      return handlerB.level - handlerA.level;
    });

  const functionItem = urlMatchList.find(item => {
    if (isMatch(currentUrl, item.router)) {
      if (item.method.length && item.method.indexOf(currentMethod) === -1) {
        return false;
      }
      // 如果不在白名单内，并且是需要被忽略的函数，则跳过函数处理
      if (
        !ignoreWildcardFunctionsWhiteList.includes(currentUrl) &&
        options.ignoreWildcardFunctions?.includes(item.functionName)
      ) {
        // 中后台 webpack 的特殊处理，忽略特定函数的通配逻辑
        return currentUrl.indexOf(item.originRouter) !== -1;
      }
      console.log(
        `Info: find url "${currentUrl}" match pattern "${item.router}", functionName="${item.functionName}"`
      );
      return true;
    }
  });

  if (functionItem?.functionName) {
    // 匹配到了函数
    invokeOptions.functionName = functionItem.functionName;
    // 构造参数
    invokeHTTPData.headers = req.headers;

    if (req.body) {
      const contentType = invokeHTTPData.headers['content-type'] || '';
      if (contentType.startsWith('application/x-www-form-urlencoded')) {
        invokeHTTPData.body = qs.stringify(req.body);
      } else if (
        contentType.startsWith('application/json') ||
        typeof req.body !== 'string'
      ) {
        invokeHTTPData.body = JSON.stringify(req.body);
      }
    } else {
      invokeHTTPData.body = undefined;
    }
    invokeHTTPData.method = req.method;
    invokeHTTPData.path = currentUrl;
    invokeHTTPData.query = req.query;
    invokeHTTPData.base64Encoded = false;
    invokeOptions.data = [invokeHTTPData];
  }

  return invokeOptions;
}
