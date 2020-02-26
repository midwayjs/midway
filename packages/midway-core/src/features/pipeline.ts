/**
 * 执行pipeline 时当前上下文存储内容
 */
interface IPipelineContext {
  /**
   * pipeline 执行原始参数
   */
  args: any;
  /**
   * 上次执行结果(只有在执行 waterfall 时才有值)
   */
  prevValue?: any;
  /**
   * valve 执行信息
   */
  info: {
    /**
     * 当前执行的 valve 名称(类名)
     */
    current: string;
    /**
     * 之前执行的 valve 名称(类名)
     */
    prev?: string;
    /**
     * 后一个将执行的 valve 名称(类名)
     */
    next?: string;
  };
  /**
   * 用于缓存当前 pipeline 执行中的中间过程参数
   * @param key 关键词
   */
  get(key: string): any;
  /**
   * 用于缓存当前 pipeline 执行中的中间过程参数
   * @param key 关键词
   * @param val 值
   */
  set(key: string, val: any): void;
  /**
   * 返回存在的所有 key
   */
  keys(): string[];
}
/**
 * 每个具体的 valve 需要继承实现该接口
 */
interface IValveHandler {
  /**
   * 最终合并结果object中的key，默认为 valve 名称
   */
  alias?: string;
  /**
   * 执行当前 valve
   * @param ctx 上下文
   */
  invoke(ctx: IPipelineContext): Promise<any>;
}
/**
 * pipeline 执行参数
 */
interface IPipelineOptions {
  /**
   * pipeline 原始参数
   */
  args?: any;
  /**
   * 这次 pipeline 执行那几个 valve 白名单
   */
  valves?: string[];
}
/**
 * pipeline 执行返回结果
 */
interface IPipelineResult<T> {
  /**
   * 是否成功
   */
  success: boolean;
  /**
   * 异常信息(如果有则返回)
   */
  error?: {
    /**
     * 异常出在那个 valve 上
     */
    valveName?: string;
    /**
     * 异常信息
     */
    message?: string;
    /**
     * 原始 Error
     */
    error?: Error;
  };
  /**
   * 返回结果
   */
  result: T;
}

interface IPipelineHandler {
  /**
   * 并行执行，使用 Promise.all
   * @param opts 执行参数
   */
  parallel<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * 并行执行，最终 result 为数组
   * @param opts 执行参数
   */
  concat<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * 串行执行，使用 foreach await
   * @param opts 执行参数
   */
  series<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * 串行执行，使用 foreach await，最终 result 为数组
   * @param opts 执行参数
   */
  concatSeries<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * 串行执行，但是会把前者执行结果当成入参，传入到下一个执行中去，最后一个执行的 valve 结果会被返回
   * @param opts 执行参数
   */
  waterfall<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
}

////////////// implements ///////////////////////

import { IApplicationContext } from '../interface';

class PipelineContext implements IPipelineContext {
  args: any;
  prevValue?: any;
  info: {
    current: string;
    prev?: string;
    next?: string;
  };

  constructor(args?: any) {
    this.args = args;
  }

  private data = new Map<string, any>();

  get(key: string): any {
    return this.data.get(key);
  }

  set(key: string, val: any): void {
    this.data.set(key, val);
  }

  keys(): string[] {
    const keys: string[] = [];
    const iter = this.data.keys();
    for (const k of iter) {
      keys.push(k);
    }
    return keys;
  }
}

interface IValveResult {
  error?: Error;
  valveName: string;
  dataKey: string;
  data: any;
}

class PipelineHandler implements IPipelineHandler {
  private applicationContext: IApplicationContext;
  // 默认的 valves (@Pipeline(['test1', 'test2']))
  private valves: string[];
  constructor(applicationContext: IApplicationContext, valves?: string[]) {
    this.applicationContext = applicationContext;
    this.valves = valves;
  }

  async parallel<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    const valves = this.prepareValves(opts);
    const res = await Promise.all(valves);

    const result: IPipelineResult<T> = { success: true, result: null };
    const data = {};
    for (const r of res) {
      if (r.error) {
        result.success = false;
        result.error = {
          valveName: r.valveName,
          message: r.error.message,
          error: r.error
        };

        return result;
      } else {
        data[r.dataKey] = r.data;
      }
    }
    result.result = data as any;
    return result;
  }

  async concat<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    const valves = this.prepareValves(opts);
    const res = await Promise.all(valves);

    const result: IPipelineResult<T> = { success: true, result: null };
    const data = [];
    for (const r of res) {
      if (r.error) {
        result.success = false;
        result.error = {
          valveName: r.valveName,
          message: r.error.message,
          error: r.error
        };

        return result;
      } else {
        data.push(r.data);
      }
    }
    result.result = data as any;
    return result;
  }

  async series<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    const valves = this.prepareValves(opts);
    const result: IPipelineResult<T> = { success: true, result: null };
    const data = {};

    for (const valve of valves) {
      // TODO
    }
    return null;
  }

  async concatSeries<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    return null;
  }

  async waterfall<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    return null;
  }

  private mergeValves(valves: string[]) {
    let items = [];
    if (this.valves && this.valves.length > 0) {
      items = this.valves;
    }

    let newItems = [];
    if (valves) {
      for (const v of valves) {
        if (items.includes(v)) {
          newItems.push(v);
        }
      }
    } else {
      newItems = items;
    }

    return newItems;
  }

  private prepareValves(opts: IPipelineOptions): Array<Promise<IValveResult>> {
    const valves = this.mergeValves(opts.valves);
    const ctx = new PipelineContext(opts.args);

    return valves.map(async (v) => {
      const rt: IValveResult = { valveName: v, dataKey: v, data: null };
      try {
        const inst: IValveHandler = await this.applicationContext.getAsync(v);
        if (inst.alias) {
          rt.dataKey = inst.alias;
        }
        rt.data = await inst.invoke(ctx);
      } catch (e) {
        rt.error = e;
      }
      return rt;
    });
  }
}
