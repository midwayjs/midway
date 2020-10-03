import { Config, Provide, ALL } from '@midwayjs/decorator';

@Provide()
export class ConfigManager {
  @Config(ALL)
  allConfig;

  @Config('bbb')
  bbbConfig;
}
