export interface MidwayApplicationOptions {
  baseDir: string;
  framework?: string;
  plugins?: any;
  container?: any;
  typescript?: boolean;
  type?: 'application' | 'agent';
}
