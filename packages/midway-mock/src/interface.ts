import { MockApplication, MockOption } from 'egg-mock';
import { IApplicationContext } from 'injection';

export interface MidwayApplicationOptions extends MockOption {
  baseDir?: string;
  framework?: string;
  plugin?: any;
  plugins?: any;
  container?: any;
  typescript?: boolean;
}

export interface MidwayMockApplication extends MockApplication {
  applicationContext: IApplicationContext;
}
