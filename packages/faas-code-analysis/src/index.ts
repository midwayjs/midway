import { tsAnalysisInstance, ITsAnalysisResult } from '@midwayjs/ts-analysis';
import { formatUpperCamel, firstCharLower, getEventKey } from './utils';
import { IParam, IResult, IFunction, IEvent } from './interface';
export * from './interface';
export * from './utils';
export const analysis = async (codePath: IParam) => {
  const result: IResult = {
    functions: {},
  };
  const analysisResult: ITsAnalysisResult = await tsAnalysisInstance(codePath);
  const funcList = [].concat(
    analysisResult.decorator.Func || [],
    analysisResult.decorator.func || []
  );
  if (!funcList.length) {
    return result;
  }

  funcList.forEach(item => {
    const params = item.params;
    const className = item.parent?.Provider?.[0]?.target?.name || '';
    const funcName = item.target.name || 'handler';
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
  });

  return result;
};
