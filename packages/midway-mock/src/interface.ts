import { MockOption } from 'egg-mock';


export { MidwayMockApplication } from './app/extend/application';

export interface MidwayApplicationOptions extends MockOption {
  baseDir?: string
  framework?: string
  plugin?: any
  plugins?: any
  container?: any
  typescript?: boolean
  worker?: number
}

