import * as pm from 'picomatch';
import {
  IMidwayContainer,
  AspectMetadata,
  IMethodAspect,
  JoinPoint,
  ScopeEnum,
} from '../interface';
import {
  ASPECT_KEY,
  getClassMetadata,
  listModule,
  Provide,
  Scope,
} from '../decorator';
import { Types } from '../util/types';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayAspectService {
  constructor(readonly applicationContext: IMidwayContainer) {}

  /**
   * load aspect method for container
   */
  public async loadAspect() {
    // for aop implementation
    const aspectModules = listModule(ASPECT_KEY);
    // sort for aspect target
    let aspectDataList = [];
    for (const module of aspectModules) {
      const data = getClassMetadata(ASPECT_KEY, module);
      aspectDataList = aspectDataList.concat(
        data.map(el => {
          el.aspectModule = module;
          return el;
        })
      );
    }

    // sort priority
    aspectDataList.sort((pre, next) => {
      return (next.priority || 0) - (pre.priority || 0);
    });

    for (const aspectData of aspectDataList) {
      // aspect instance init
      const aspectIns = await this.applicationContext.getAsync<IMethodAspect>(
        aspectData.aspectModule
      );
      await this.addAspect(aspectIns, aspectData);
    }
  }

  public async addAspect(aspectIns: IMethodAspect, aspectData: AspectMetadata) {
    const module = aspectData.aspectTarget;
    const names = Object.getOwnPropertyNames(module.prototype);
    const isMatch = aspectData.match ? pm(aspectData.match) : () => true;

    for (const name of names) {
      if (name === 'constructor' || !isMatch(name)) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(
        module.prototype,
        name
      );
      if (!descriptor || descriptor.writable === false) {
        continue;
      }

      this.interceptPrototypeMethod(module, name, aspectIns);
    }
  }

  /**
   * intercept class method in prototype
   * @param Clz class you want to intercept
   * @param methodName method name you want to intercept
   * @param aspectObject aspect object, before, round, etc.
   */
  public interceptPrototypeMethod(
    Clz: new (...args: any[]) => any,
    methodName: string,
    aspectObject: IMethodAspect | (() => IMethodAspect)
  ) {
    const originMethod = Clz.prototype[methodName];

    if (Types.isAsyncFunction(Clz.prototype[methodName])) {
      Clz.prototype[methodName] = async function (...args: unknown[]): Promise<unknown> {
        const opts: ProcessOptions = {
          args,
          methodName,
          target: this,
        };
        return processAsync(aspectObject, originMethod, opts);
      };
    } else {
      Clz.prototype[methodName] = function (...args: unknown[]) {
        const opts: ProcessOptions = {
          args,
          methodName,
          target: this,
        };
        return processSync(aspectObject, originMethod, opts);
      };
    }
  }
}

interface ProcessOptions {
  args: unknown[],
  methodName: string;
  target: any
}
async function processAsync(
  aspectObjectInput: IMethodAspect | (() => IMethodAspect),
  originMethod: Function,
  options: ProcessOptions
): Promise<unknown> {

  let error: Error;
  let result: unknown;
  const newProceed = (...args: unknown[]) => {
    return originMethod.apply(this, args);
  };
  const joinPoint = Object.assign({}, options, {proceed: newProceed, proceedIsAsyncFunction: true}) as JoinPoint;

  let aspectObject: IMethodAspect;
  if (typeof aspectObjectInput === 'function') {
    aspectObject = aspectObjectInput();
  } else {
    aspectObject = aspectObjectInput;
  }

  try {
    await aspectObject.before?.(joinPoint);
    if (aspectObject.around) {
      result = await aspectObject.around(joinPoint);
    } else {
      result = await originMethod.call(this, ...joinPoint.args);
    }
    joinPoint.proceed = undefined;
    const resultTemp = await aspectObject.afterReturn?.(
      joinPoint,
      result
    );
    result = typeof resultTemp === 'undefined' ? result : resultTemp;
    return result;
  } catch (err) {
    joinPoint.proceed = undefined;
    error = err;
    if (aspectObject.afterThrow) {
      await aspectObject.afterThrow(joinPoint, error);
    } else {
      throw err;
    }
  } finally {
    await aspectObject.after?.(joinPoint, result, error);
  }
}

function processSync(
  aspectObjectInput: IMethodAspect | (() => IMethodAspect),
  originMethod: Function,
  options: ProcessOptions
): unknown {

  let error: Error;
  let result: unknown;
  const newProceed = (...args: unknown[]) => {
    return originMethod.apply(this, args);
  };
  const joinPoint = Object.assign({}, options, {proceed: newProceed, proceedIsAsyncFunction: false}) as JoinPoint;

  let aspectObject: IMethodAspect;
  if (typeof aspectObjectInput === 'function') {
    aspectObject = aspectObjectInput();
  } else {
    aspectObject = aspectObjectInput;
  }

  try {
    aspectObject.before?.(joinPoint);
    if (aspectObject.around) {
      result = aspectObject.around(joinPoint);
    } else {
      result = originMethod.call(this, ...joinPoint.args);
    }
    joinPoint.proceed = undefined;
    const resultTemp = aspectObject.afterReturn?.(joinPoint, result);
    result = typeof resultTemp === 'undefined' ? result : resultTemp;
    return result;
  } catch (err) {
    joinPoint.proceed = undefined;
    error = err;
    if (aspectObject.afterThrow) {
      aspectObject.afterThrow(joinPoint, error);
    } else {
      throw err;
    }
  } finally {
    aspectObject.after?.(joinPoint, result, error);
  }
}
