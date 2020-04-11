import { Config, Provide } from '@midwayjs/decorator';

@Provide()
export class ConfigManager {
  @Config('')
  allConfig;

  @Config('bbb')
  bbbConfig;
}
