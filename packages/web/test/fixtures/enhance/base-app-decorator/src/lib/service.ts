import { Config, Plugin, Provide } from '@midwayjs/decorator';
import { IPipelineHandler } from '@midwayjs/core';
import { Pipeline } from '@midwayjs/decorator';

@Provide()
export class BaseService {

  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  @Pipeline(['stageOne'])
  p1: IPipelineHandler;

  async doStages(): Promise<string> {
    const rt = await this.p1.series<string>({args: {aa: 123}});
    console.log('---asd', rt);
    return rt.result;
  }
}
