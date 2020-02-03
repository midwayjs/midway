import { IEnvironmentService } from '../interface';

export class MidwayEnvironmentService implements IEnvironmentService {
  environment: string;

  getCurrentEnvironment() {
    if (!this.environment) {
      this.environment = process['MIDWAY_SERVER_ENV'] || process['NODE_ENV'] || 'production';
    }
    return this.environment;
  }

  setCurrentEnvironment(environment: string) {
    this.environment = environment;
  }
}
