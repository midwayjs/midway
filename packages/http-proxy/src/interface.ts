export interface HttpProxyStrategy {
  match?: RegExp;
  host?: string;
  target?: string;
  ignoreHeaders?: {
    [key: string]: boolean;
  }
}

export interface HttpProxyConfig extends HttpProxyStrategy {
  strategy?: {
    [strategyName: string]: HttpProxyStrategy;
  }
}
