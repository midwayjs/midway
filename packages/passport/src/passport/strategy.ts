import { IncomingMessage } from 'http';
import { IPassportStrategy, StrategyCreatedStatic } from '../interface';

export abstract class Strategy {
  name?: string | undefined;
  abstract authenticate(req: IncomingMessage, options?: any): any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Strategy extends StrategyCreatedStatic {
  // empty
}

export abstract class AbstractStrategyWrapper implements IPassportStrategy {
  abstract validate(...args): any;
  abstract getStrategyOptions(): any;
}
