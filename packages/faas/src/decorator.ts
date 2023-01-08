import { createRequestParamDecorator } from '@midwayjs/core';

// 实现装饰器
export const Event = () => {
  return createRequestParamDecorator(ctx => {
    return ctx.originEvent && ctx.originContext ? ctx.originEvent : ctx;
  });
};
