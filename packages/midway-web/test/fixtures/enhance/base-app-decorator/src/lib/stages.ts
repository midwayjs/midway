import { IValveHandler, IPipelineContext } from '@midwayjs/core';
import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class StageOne implements IValveHandler {
  @Inject()
  ctx: any;

  async invoke(ctx: IPipelineContext): Promise<any> {
    if (ctx.args.aa !== 123) {
      throw new Error('args aa is undefined');
    }
    ctx.set('stageone', 'this is stage one');
    ctx.set('stageone_date', Date.now());
    if (ctx.info.current !== 'stageOne') {
      throw new Error('current stage is not stageOne');
    }
    if (this.ctx === undefined) {
      throw new Error('inject ctx is undefined');
    }
    if (ctx.info.prev) {
      throw new Error('stageOne prev stage is not undefined');
    }

    return 'stageone';
  }
}

@Provide()
export class StageTwo implements IValveHandler {

  @Inject()
  ctx: any;

  async invoke(ctx: IPipelineContext): Promise<any> {
    const keys = ctx.keys();
    if (keys.length !== 2) {
      throw new Error('keys is not equal');
    }
    ctx.set('stagetwo', ctx.get('stageone') + 1);
    ctx.set('stagetwo_date', Date.now());
    if (ctx.info.prevValue !== 'stageone') {
      throw new Error('stageone result empty');
    }
    if (ctx.info.current !== 'stageTwo') {
      throw new Error('current stage is not stageTwo');
    }
    if (ctx.info.next) {
      throw new Error('stageTwo next stage is not undefined');
    }
    if (ctx.info.prev !== 'stageOne') {
      throw new Error('prev stage is not stageOne');
    }

    return 'stagetwo';
  }
}
