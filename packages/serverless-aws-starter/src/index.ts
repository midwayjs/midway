import { BaseRuntimeEngine, LightRuntime } from '@midwayjs/runtime-engine';
import { AWSRuntime } from './runtime';

export { asyncWrapper } from '@midwayjs/runtime-engine';

export const start = async () => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  const runtimeEngine = new BaseRuntimeEngine();
  runtimeEngine.add(engine => {
    engine.addBaseRuntime(new AWSRuntime());
  });

  await runtimeEngine.ready();
  return runtimeEngine.getCurrentRuntime() as LightRuntime;
};
