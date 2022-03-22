export interface HttpProxyConfig {
  match: RegExp;
  host?: string;
  target?: string;
  ignoreHeaders?: {
    [key: string]: boolean;
  }
}
