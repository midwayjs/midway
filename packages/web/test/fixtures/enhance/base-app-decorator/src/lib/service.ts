import { config, plugin, provide, IPipelineHandler } from '../../../../../../src';
import { Pipeline } from '@midwayjs/decorator';

@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

  @Pipeline(['stageOne'])
  p1: IPipelineHandler;

  async doStages(): Promise<string> {
    const rt = await this.p1.series<string>({args: {aa: 123}});
    console.log('---asd', rt);
    return rt.result;
  }
}
