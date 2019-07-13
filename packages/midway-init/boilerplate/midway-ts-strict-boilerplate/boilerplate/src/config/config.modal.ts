import { EggAppConfig, PowerPartial } from 'midway'


export interface DefaultConfig extends PowerPartial<EggAppConfig> {
  welcomeMsg: string
}
