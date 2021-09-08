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
    applicationContext,
    preloadModules,
  } = options;
  const { start } = starter;
  let starterInstance;
  let boot;
  layers.unshift(engine => {
    engine.addRuntimeExtension({
      async beforeFunctionStart(runtime) {
        starterInstance = new framework();
        starterInstance.configure({
          initializeContext,
          preloadModules,
          applicationAdapter: runtime,
        });
        boot = new BootstrapStarter();
        boot
          .configure({
            baseDir,
            applicationContext,
          })
          .load(starterInstance);
        await boot.init();
        await boot.run();
      },
    });
  });
  const runtime = await start({
    layers: layers,
    getApp: () => {
      return starterInstance && starterInstance.getApplication();
    },
    initContext: initializeContext,
  });
  return {
    runtime,
    framework: starterInstance,
    innerBootStarter: boot,
    // 分析装饰器上面的函数表
    getFunctionsFromDecorator: async () => {
      return analysisDecorator(appDir);
    },
    invoke: async (handlerName: string, trigger: any[]) => {
      return runtime.asyncEvent(async (...args) => {
        return starterInstance.handleInvokeWrapper(handlerName)(...args);
      })(...trigger);
    },
  };
};
