import { BaseRuntimeEngine, LightRuntime } from '@midwayjs/runtime-engine';
import { AWSRuntime } from './runtime';

export { asyncWrapper } from '@midwayjs/runtime-engine';

export const createRuntime = async () => {
  const runtimeEngine = new BaseRuntimeEngine();
  runtimeEngine.add(engine => {
    engine.addBaseRuntime(new AWSRuntime());
  });

  await runtimeEngine.ready();
  return runtimeEngine.getCurrentRuntime() as LightRuntime;
};
