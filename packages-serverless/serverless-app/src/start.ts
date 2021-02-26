const { BootstrapStarter } = require('@midwayjs/bootstrap');
import { analysisDecorator } from './utils';
export const start2 = async options => {
  const {
    appDir,
    baseDir,
    framework,
    starter,
    layers = [],
    initializeContext,
    preloadModules,
  } = options;
  const { start } = starter;
  let starterInstance;
  layers.unshift(engine => {
    engine.addRuntimeExtension({
      async beforeFunctionStart(runtime) {
        starterInstance = new framework();
        starterInstance.configure({
          initializeContext,
          preloadModules,
          applicationAdapter: runtime,
        });
        const boot = new BootstrapStarter();
        boot
          .configure({
            baseDir,
          })
          .load(starterInstance);
        await boot.init();
        await boot.run();
      },
    });
  });
  const runtime = await start({
    layers: layers,
    initContext: initializeContext,
  });
  return {
    runtime,
    framework: starterInstance,
    // ast 分析装饰器上面的函数表
    getFunctionsFromDecorator: async () => {
      return analysisDecorator(appDir);
    },
    invoke: async (handlerName: string, trigger: any[]) => {
      return runtime.asyncEvent(async ctx => {
        return starterInstance.handleInvokeWrapper(handlerName)(ctx);
      })(...trigger);
    },
  };
};
