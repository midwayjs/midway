import { IncomingMessage } from 'http';
import { StrategyCreatedStatic } from '../interface';

export abstract class Strategy {
  name?: string | undefined;
  abstract authenticate(req: IncomingMessage, options?: any): any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Strategy extends StrategyCreatedStatic {
  // empty
}
