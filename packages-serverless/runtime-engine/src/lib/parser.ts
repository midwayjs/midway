import { PropertyParser } from '../interface';

export enum EnvPropertyKey {
  INIT_TIMEOUT = 'INIT_TIMEOUT', // 初始化函数
  INIT_HANDLER = 'INIT_HANDLER', // 初始化函数
  FUNC_TIMEOUT = 'FUNC_TIMEOUT', // 初始化函数
  FUNC_HANDLER = 'FUNC_HANDLER', // 执行函数
  FUNC_RUNTIME = 'FUNC_RUNTIME', // 函数运行时名字
  ENTRY_DIR = 'ENTRY_DIR', // 入口目录
  TRIGGER_TYPE = 'TRIGGER_TYPE', // 触发器类型
  FUNC_LAYER = 'FUNC_LAYER', // layer
  LOGER_LEVEL = 'LOGGER_LEVEL', // layer
  EAGLEEYE_FLAG = 'EAGLE_FLAG', // layer
}

export class EnvPropertyParser<T>
  extends Map<string, T>
  implements PropertyParser<T> {
  setProperty(propertyKey: string, value) {
    process.env[propertyKey] = value;
  }

  getProperty(propertyKey: string, defaultValue?): T {
    if (!this.has(propertyKey)) {
      if (process.env[propertyKey]) {
        this.set(propertyKey, process.env[propertyKey] as any);
      } else if (process.env[propertyKey.toUpperCase()]) {
        this.set(propertyKey, process.env[propertyKey.toUpperCase()] as any);
      } else if (process.env[propertyKey.toLowerCase()]) {
        this.set(propertyKey, process.env[propertyKey.toLowerCase()] as any);
      } else {
        this.set(propertyKey, defaultValue || '');
      }
    }

    return this.get(propertyKey);
  }

  getInitTimeout() {
    return this.getProperty(EnvPropertyKey.INIT_TIMEOUT, 3 * 60 * 1000); // 3min
  }

  getFuncTimeout() {
    return this.getProperty(EnvPropertyKey.FUNC_TIMEOUT, 3 * 60 * 1000); // 3min
  }

  getInitHandler() {
    const funcHandler: any = this.getFunctionHandler();
    const [entryFile] = funcHandler.split('.');
    return this.getProperty(
      EnvPropertyKey.INIT_HANDLER,
      `${entryFile}.initialize`
    );
  }

  getFunctionHandler() {
    return this.getProperty(EnvPropertyKey.FUNC_HANDLER, 'index.handler');
  }

  getFunctionRuntime() {
    return this.getProperty(EnvPropertyKey.FUNC_RUNTIME, 'function_runtime');
  }

  getEntryDir() {
    return this.getProperty(EnvPropertyKey.ENTRY_DIR, process.cwd());
  }

  getTriggerType() {
    return this.getProperty(EnvPropertyKey.TRIGGER_TYPE, 'default_trigger');
  }

  getFunctionLayer() {
    return this.getProperty(EnvPropertyKey.FUNC_LAYER, '');
  }

  getLoggerLevel() {
    return this.getProperty(EnvPropertyKey.LOGER_LEVEL, 'WARN');
  }

  getTraceFlag() {
    return this.getProperty(EnvPropertyKey.EAGLEEYE_FLAG, 'on');
  }
}
