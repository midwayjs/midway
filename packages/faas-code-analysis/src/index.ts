import { Analyzer, AnalyzeResult } from '@midwayjs/mwcc';
import { formatUpperCamel, firstCharLower, getEventKey } from './utils';
import { IParam, IResult, IFunction, IEvent } from './interface';
export * from './interface';
export * from './utils';
export const analysis = async (codePath: IParam) => {
  if (Array.isArray(codePath)) {
    codePath = codePath[0];
    console.log('[warn] code analysi only support 1 source dir');
  }
  const analysisInstance = new Analyzer({
    projectDir: codePath,
    decoratorLowerCase: true,
  });
  const analysisResult: AnalyzeResult = analysisInstance.analyze();
  return analysisResultToSpec(analysisResult);
};

export const analysisResultToSpec = (analysisResult: AnalyzeResult) => {
  const result: IResult = {
    functions: {},
  };

  const provideList = analysisResult?.decorator?.provide || [];
  provideList.forEach(provide => {
    if (!provide.childDecorators.func) {
      return;
    }
    provide.childDecorators.func.forEach(item => {
      formatFuncInfo(result, item, provide.target);
    });
  });

  const funcList = analysisResult?.decorator?.func || [];

  funcList.forEach(item => {
    if (item.target.type !== 'class') {
      return;
    }
    formatFuncInfo(result, item);
  });

  return result;
};

const formatFuncInfo = (result, funcInfo, parentTarget?) => {
  const params = funcInfo.params;
  let className = parentTarget?.name || '';
  let funcName = funcInfo.target.name || 'handler';

  if (funcInfo.target.type === 'class') {
    className = funcInfo.target.name;
    funcName = 'handler';
  }
  let handler;
  let trigger: IEvent;
  if (typeof params[0] === 'string') {
    handler = params[0];
    trigger = params[1];
  } else {
    handler = `${formatUpperCamel(className)}.${formatUpperCamel(funcName)}`;
    trigger = params[0];
  }

  const funName = handler.replace(/\.handler$/, '').replace(/\./g, '-');

  const existsFuncData: IFunction = result.functions[funName] || {
    handler: '',
    events: [],
  };
  existsFuncData.handler = handler;
  const events = existsFuncData.events || [];

  if (!trigger) {
    trigger = {
      event: 'http',
    };
  }

  if (trigger.event) {
    const eventType = trigger.event.toLowerCase();
    const event: IEvent = { [eventType]: true };
    if (eventType === 'http') {
      event.http = {
        method: [(trigger.method || 'GET').toUpperCase()],
        path:
          trigger.path ||
          `/${firstCharLower(className)}/${firstCharLower(funcName)}`,
      };
    }
    // 防止有重复的触发器
    const currentEventKey = getEventKey(eventType, event[eventType]);
    const isExists = events.find(event => {
      if (event[eventType]) {
        const key = getEventKey(eventType, event[eventType]);
        return key === currentEventKey;
      }
    });
    if (!isExists) {
      events.push(event);
    }
  }
  existsFuncData.events = events;
  result.functions[funName] = existsFuncData;
};
