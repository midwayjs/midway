import { Config, Provide } from '@midwayjs/decorator';
import { MIDWAY_ALL_CONFIG } from '../../../../src';

@Provide()
export class ConfigManager {
  @Config(MIDWAY_ALL_CONFIG)
  allConfig;

  @Config('bbb')
  bbbConfig;
}
