export interface ActionConfigOptions {}

export interface IComponentConfig {
  name?: string;
  desc?: string;
  // 重试次数
  retryCount?: number;
  // 触发执行
  trigger: IComponentEventBase;
  // 回滚
  rollback?: IComponentEventBase;
}

export interface IComponentEventBase {
  data: any;
  // 是否异步
  async: boolean;
  timeout: number;
}
// 本地组件
export interface IComponentEventLocal extends IComponentEventBase {
  type:  'local';
}
// http 远程组件
export interface IComponentEventHTTP extends IComponentEventBase {
  type:  'http';
  method: 'get' | 'post';
  url: string;
  headers?: {
    [key: string]: string;
  }
}