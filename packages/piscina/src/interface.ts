import { IMidwayApplication, IMidwayContext, ServiceFactoryConfigOption } from '@midwayjs/core';
import type { Piscina } from 'piscina';

/**
 * Piscina 构造函数选项类型
 */
export type PiscinaOptions = Omit<
  NonNullable<ConstructorParameters<typeof Piscina>[0]>,
  'filename'
>;

/**
 * 单个线程池配置
 */
export interface PiscinaPoolConfig extends PiscinaOptions {
  /**
   * Worker 文件路径（相对于 baseDir 或绝对路径）
   */
  workerFile: string;
}

/**
 * Piscina 组件配置
 */
export type PiscinaConfig = ServiceFactoryConfigOption<PiscinaPoolConfig>;
export interface Application extends IMidwayApplication<IMidwayContext> {}
export interface Context extends IMidwayContext {}

export interface IPiscinaTask<P = unknown, R = unknown> {
  execute(payload: P): Promise<R>;
}