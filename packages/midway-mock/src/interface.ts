import { MockApplication } from 'egg-mock';

export interface MidwayApplicationOptions {
  baseDir?: string;
  framework?: string;
  plugins?: any;
  container?: any;
  typescript?: boolean;
}

export interface MidwayMockApplication extends MockApplication {
  /**
   * Mock class function
   */
  mockClassFunction(className: string, methodName: string, fn: any): any;
}
