export interface FCAPIGatewayEvent {
  path: string;
  httpMethod: string;
  headers: object;
  queryParameters: object;
  pathParameters: object;
  body: string;
  isBase64Encoded: 'true' | 'false' | boolean;
}

export interface FCHTTPEvent {
  domain: string;
  method: string;
  clientIP: string;
  url: string;
  path: string;
  queries: object;
  headers: object;
  body: string | Buffer;
}

export interface SCFAPIGatewayEvent {
  /**
   * 请求来源的 API 网关的配置信息、请求标识、认证信息、来源信息。其中：
   * serviceId，path，httpMethod 指向 API 网关的服务Id、API 的路径和方法；
   * stage 指向请求来源 API 所在的环境；
   * requestId 标识当前这次请求的唯一 ID；
   * identity 标识用户的认证方法和认证的信息；
   * sourceIp 标识请求来源 IP
   */
  requestContext: {
    serviceId: string;
    path: string;
    httpMethod: string;
    requestId: string;
    identity: {
      secretId?: string;
    };
    sourceIp: string;
    stage: string;
  };
  // 记录实际请求的完整 Header 内容
  headers: { [key: string]: string };
  // 记录实际请求的完整 Body 内容
  body?: string;
  // 记录在 API 网关中配置过的 Query 参数以及实际取值
  queryStringParameters: { [key: string]: string };
  // 记录在 API 网关中配置过的 Path 参数以及实际取值
  pathParameters: { [key: string]: string };
  // 记录在 API 网关中配置过的 Header 参数以及实际取值
  headerParameters: { [key: string]: string };
  stageVariables: {
    stage: string;
  };
  // 记录实际请求的完整 Path 信息
  path: string;
  // 请求地址的查询参数
  queryString: { [key: string]: string };
  httpMethod: string;
}

export interface SCFContext {
  callbackWaitsForEmptyEventLoop: boolean;
  memory_limit_in_mb: number;
  time_limit_in_ms: number;
  request_id: string;
  environ: string;
  function_version: string;
  function_name: string;
  namespace: string;
}

export interface UploadEvent {
  files: {
    filename: string;
    fieldname: string;
    mimtType: string;
    data: Buffer;
  }[];
}

export type GatewayEvent = FCAPIGatewayEvent &
  SCFAPIGatewayEvent &
  FCHTTPEvent &
  UploadEvent;
