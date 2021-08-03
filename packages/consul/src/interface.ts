import * as Consul from "consul";
import { ConsulOptions } from "consul";
import RegisterOptions = Consul.Agent.Service.RegisterOptions;

export interface IServiceBalancer {
  /**
   * 根据服务名称选择实例
   * @param serviceName 注册的服务名称
   * @param passingOnly 只返回通过健康检查的实例，默认为 true
   */
  select(serviceName: string, passingOnly?: boolean): any | never;
}

export interface IConsulBalancer {
  /**
   * 根绝策略返回负载均衡器
   * @param strategy 负载均衡策略
   */
  getServiceBalancer(strategy?: string): IServiceBalancer;
}

export interface IConsulProviderInfoOptions extends ConsulOptions {
  /**
   * 本服务是否注册到 consul 服务器，默认是 NO 不会执行注册
   */
  register?: boolean;

  /**
   * 应用正常关闭的额时候自动反注册，默认是 YES 会执行反注册
   * 如果 register=false 改参数无效
   */
  deregister?: boolean;

  /**
   * 调用服务负载均衡的策略(default、random)，默认是 random 随机
   */
  strategy?: string
}

export interface IConsulRegisterInfoOptions extends RegisterOptions {
  /**
   * 注册 id 标识，默认是 name:address:port 的组合
   */
  id?: string;

  /**
   * 服务名称
   */
  name: string;

  /**
   * 服务地址
   */
  address: string;

  /**
   * 服务端口
   */
  port: number;

  /**
   * 服务标签
   */
  tags?: string[];

  /**
   * 健康检查配置，组件默认会配置一个(检查间隔是3秒)，如果指定 check=false 则关闭 consul 健康检查
   */
  check?: {
    tcp?: string;
    http?: string;
    script?: string;
    interval?: string;
    ttl?: string;
    notes?: string;
    status?: string;
  }
}
