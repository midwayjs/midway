import { MockApplication } from 'egg-mock';

export interface MidwayApplicationOptions {
  baseDir?: string;
  framework?: string;
  plugins?: any;
  container?: any;
  typescript?: boolean;
}

export interface MidwayMockApplication extends MockApplication {
}
