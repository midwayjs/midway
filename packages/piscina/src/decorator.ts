import { DecoratorManager, MetadataManager, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { PISCINA_TASK_KEY } from './constants';

/**
 * Piscina Task 装饰器
 * 用于标记 Worker 中的任务类
 * 
 * @example
 * ```typescript
 * @PiscinaTask('calculate')
 * export class CalculateTask {
 *   async execute(payload: any) {
 *     return payload.a + payload.b;
 *   }
 * }
 * ```
 */
export function PiscinaTask(handler: string): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(PISCINA_TASK_KEY, target);
    // 保存 handler 名称到元数据
    MetadataManager.defineMetadata(PISCINA_TASK_KEY, { handler }, target);
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}

