export interface HttpProxyStrategy {
  match?: RegExp;
  host?: string;
  target?: string;
  proxyTimeout?: number;
  ignoreHeaders?: {
    [key: string]: boolean;
  }
}

export interface HttpProxyConfig extends HttpProxyStrategy {
  enable?: boolean;
  default?: HttpProxyStrategy;
  strategy?: {
    [strategyName: string]: HttpProxyStrategy;
  }
}
