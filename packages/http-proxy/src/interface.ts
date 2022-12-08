export interface HttpProxyStrategy {
  match?: RegExp;
  host?: string;
  target?: string;
  proxyTimeout?: number;
  ignoreHeaders?: {
    [key: string]: boolean;
  }
  // 额外的axios请求config, 详情见 https://axios-http.com/docs/req_config
  extReqOptions?: { [key: string]: any }
}

export interface HttpProxyConfig extends HttpProxyStrategy {
  default?: HttpProxyStrategy;
  strategy?: {
    [strategyName: string]: HttpProxyStrategy;
  }
}
