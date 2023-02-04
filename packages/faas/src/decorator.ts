import {
  createRequestParamDecorator,
  PipeUnionTransform,
} from '@midwayjs/core';

// 实现装饰器
export const Event = (pipes?: PipeUnionTransform[]) => {
  return createRequestParamDecorator(ctx => {
    return ctx.originEvent && ctx.originContext ? ctx.originEvent : ctx;
  }, pipes);
};
