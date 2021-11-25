import { MidwayConfigService } from '@midwayjs/core';
import {
  saveClassMetadata,
  saveModule,
  saveProviderId,
  Scope,
  ScopeEnum,
  generateRandomId,
} from '@midwayjs/decorator';
import { BOOTSTRATEGY_KEY } from './contants';

export interface BootStrategyParams {
  useParams?: (
    config?: MidwayConfigService
  ) => Promise<Record<string, any>> | Record<string, any>;
}

/**
 *
 * 自启动 passport策略
 *
 * @param option {Strategy} Target passport策略
 * @method
 */
export const BootStrategy = function (option?: BootStrategyParams): any {
  return Target => {
    if (typeof Target === 'function') {
      saveProviderId(generateRandomId(), Target);
      /**
       * @see {@link PassportConfiguration}
       */
      saveModule(BOOTSTRATEGY_KEY, Target);
      saveClassMetadata(BOOTSTRATEGY_KEY, option, Target);
      Scope(ScopeEnum.Request)(Target);
    } else {
      throw new Error('[BootStrategy]: attach target must be class');
    }
  };
};
