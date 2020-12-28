import { IEnvironmentService } from '../interface';
import { isDevelopmentEnvironment } from '../util';

export class MidwayEnvironmentService implements IEnvironmentService {
  environment: string;

  getCurrentEnvironment() {
    if (!this.environment) {
      this.environment =
        process.env['MIDWAY_SERVER_ENV'] || process.env['NODE_ENV'] || 'prod';
    }
    return this.environment;
  }

  setCurrentEnvironment(environment: string) {
    this.environment = environment;
  }

  isDevelopmentEnvironment() {
    return isDevelopmentEnvironment(this.environment);
  }
}
