export interface HttpProxyConfig {
  match: RegExp;
  host?: string;
  target?: string;
}
