import { IMidwayContainer } from '../interface';
import { getProviderName, ObjectIdentifier } from '@midwayjs/decorator';

interface IPipelineInfo {
  /**
   * 上次执行结果(只有在执行 waterfall 时才有值)
   */
  prevValue?: any;
  /**
   * 当前执行的 valve 类
   */
  current: IValveHandler;
  /**
   * 当前执行的 valve 名称(类名)
   */
  currentName: string;
  /**
   * 之前执行的 valve 类
   */
  prev?: IValveHandler;
  /**
   * 之前执行的 valve 名称(类名)
   */
  prevName?: string;
  /**
   * 后一个将执行的 valve 类
   */
  next?: IValveHandler;
  /**
   * 后一个将执行的 valve 名称(类名)
   */
  nextName?: string;
}

/**
 * 执行pipeline 时当前上下文存储内容
 */
export interface IPipelineContext {
  /**
   * pipeline 执行原始参数
   */
  args: any;
  /**
   * valve 执行信息
   */
  info?: IPipelineInfo;
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
export interface IValveHandler {
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
export interface IPipelineOptions {
  /**
   * pipeline 原始参数
   */
  args?: any;
  /**
   * 这次 pipeline 执行那几个 valve 白名单
   */
  valves?: valvesType;
}
/**
 * pipeline 执行返回结果
 */
export interface IPipelineResult<T> {
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

export interface IPipelineHandler {
  parallel<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  concat<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  series<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  concatSeries<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  waterfall<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
}

interface IValveResult {
  error?: Error;
  valveName: string;
  dataKey: string;
  data: any;
}

type valvesType = Array<ObjectIdentifier | (new (...args: any[]) => any)>;

////////////// implements ///////////////////////

export class PipelineContext implements IPipelineContext {
  args: any;
  info: IPipelineInfo = { current: null, currentName: null };

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

export class MidwayPipelineService implements IPipelineHandler {
  // 默认的 valves (@Pipeline(['test1', 'test2']))
  constructor(
    readonly applicationContext: IMidwayContainer,
    readonly valves?: valvesType
  ) {}

  /**
   * 并行执行，使用 Promise.all
   * @param opts 执行参数
   */
  async parallel<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    const valves = this.prepareParallelValves(opts);
    const res = await Promise.all(valves);
    return this.packResult<T>(res, false);
  }

  /**
   * 并行执行，最终 result 为数组
   * @param opts 执行参数
   */
  async concat<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    const valves = this.prepareParallelValves(opts);
    const res = await Promise.all(valves);
    return this.packResult<T>(res, true);
  }

  /**
   * 串行执行，使用 foreach await
   * @param opts 执行参数
   */
  async series<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    const valves = this.mergeValves(opts.valves);
    const ctx = new PipelineContext(opts.args);

    const result: IPipelineResult<T> = { success: true, result: null };
    const data = {};

    const info = {
      prevValue: null,
      current: null,
      currentName: null,
      prev: null,
      prevName: null,
      next: null,
      nextName: null,
    };
    let nextIdx = 1;
    for (const v of valves) {
      info.prev = info.current;
      info.current = v;
      if (nextIdx < valves.length) {
        info.next = valves[nextIdx];
      } else {
        info.next = undefined;
      }
      nextIdx += 1;
      ctx.info = info;

      try {
        const inst: IValveHandler = await this.applicationContext.getAsync(v);
        const tmpValue = await inst.invoke(ctx);
        let key = v;
        if (inst.alias) {
          key = inst.alias;
        }
        data[key] = tmpValue;
        info.prevValue = tmpValue;
      } catch (e) {
        result.success = false;
        result.error = {
          valveName: typeof v === 'string' ? v : v.name,
          message: e.message,
          error: e,
        };

        return result;
      }
    }
    result.result = data as any;

    return result;
  }

  /**
   * 串行执行，使用 foreach await，最终 result 为数组
   * @param opts 执行参数
   */
  async concatSeries<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    const valves = this.mergeValves(opts.valves);
    const ctx = new PipelineContext(opts.args);

    const result: IPipelineResult<T> = { success: true, result: null };
    const data = [];

    const info = {
      prevValue: null,
      current: null,
      currentName: null,
      prev: null,
      prevName: null,
      next: null,
      nextName: null,
    };
    let nextIdx = 1;
    for (const v of valves) {
      info.prev = info.current;
      info.prevName = getName(info.prev);
      info.current = v;
      info.currentName = getName(info.current);
      if (nextIdx < valves.length) {
        info.next = valves[nextIdx];
        info.nextName = getName(info.next);
      } else {
        info.next = undefined;
        info.nextName = undefined;
      }
      nextIdx += 1;
      ctx.info = info;

      try {
        const inst: IValveHandler = await this.applicationContext.getAsync(v);
        const tmpValue = await inst.invoke(ctx);
        data.push(tmpValue);
        info.prevValue = tmpValue;
      } catch (e) {
        result.success = false;
        result.error = {
          valveName: typeof v === 'string' ? v : v.name,
          message: e.message,
          error: e,
        };

        return result;
      }
    }
    result.result = data as any;

    return result;
  }

  /**
   * 串行执行，但是会把前者执行结果当成入参，传入到下一个执行中去，最后一个执行的 valve 结果会被返回
   * @param opts 执行参数
   */
  async waterfall<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>> {
    const result = await this.concatSeries<T>(opts);
    if (result.success) {
      const data = result.result;
      result.result = data[(data as any).length - 1];
    }
    return result;
  }

  private mergeValves(valves: valvesType) {
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

  private prepareParallelValves(
    opts: IPipelineOptions
  ): Array<Promise<IValveResult>> {
    const valves = this.mergeValves(opts.valves);
    const ctx = new PipelineContext(opts.args);

    return valves.map(async v => {
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

  private packResult<T>(res, resultIsArray = false) {
    const result: IPipelineResult<T> = { success: true, result: null };
    let data;
    if (resultIsArray) {
      data = [];
    } else {
      data = {};
    }

    for (const r of res) {
      if (r.error) {
        result.success = false;
        result.error = {
          valveName:
            typeof r.valveName === 'string' ? r.valveName : r.valveName.name,
          message: r.error.message,
          error: r.error,
        };

        return result;
      } else {
        if (resultIsArray) {
          data.push(r.data);
        } else {
          data[r.dataKey] = r.data;
        }
      }
    }
    result.result = data as any;
    return result;
  }
}

function getName(target) {
  if (target) {
    return getProviderName(target);
  }
  return null;
}
