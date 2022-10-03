import { Config, Provide, ALL } from '../../../../src';

@Provide()
export class ConfigManager {
  @Config(ALL)
  allConfig;

  @Config('bbb')
  bbbConfig;
}
