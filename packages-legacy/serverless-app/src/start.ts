import { analysisDecorator } from './utils';
export const start3 = async options => {
  const {
    appDir,
    framework,
    starter,
    layers = [],
    initializeContext,
    preloadModules,
  } = options;
  const { start } = starter;
  layers.unshift(engine => {
    engine.addRuntimeExtension({
      async beforeFunctionStart(runtime) {
        framework.configure({
          initializeContext,
          preloadModules,
          applicationAdapter: runtime,
        });
        await framework.initialize();
      },
    });
  });
  const runtime = await start({
    layers: layers,
    getApp: () => {
      return framework && framework.getApplication();
    },
    initContext: initializeContext,
  });
  return {
    runtime,
    framework,
    // 分析装饰器上面的函数表
    getFunctionsFromDecorator: async () => {
      return analysisDecorator(appDir);
    },
    invoke: async (handlerName: string, trigger: any[]) => {
      return runtime.asyncEvent(async (...args) => {
        return framework.handleInvokeWrapper(handlerName)(...args);
      })(...trigger);
    },
  };
};
