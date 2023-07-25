import {
  Autoload,
  Config,
  Destroy,
  Init,
  Inject,
  MidwayError,
  MidwayInformationService,
  Provide,
  Singleton,
} from '@midwayjs/core';
import * as Consul from 'consul';
import { IConsulOptions, IService, IServiceHealth } from './interface';

export class MidwayConsulError extends MidwayError {
  constructor(message: string) {
    super(message);
  }
}

type IKvKey = {
  LockIndex: number;
  Key: string;
  Flags: number;
  Value: string;
  CreateIndex: number;
  ModifyIndex: number;
};

@Provide()
@Autoload()
@Singleton()
export class ConsulService {
  @Config('consul')
  private config: IConsulOptions;

  @Inject()
  private infoSrv: MidwayInformationService;

  serviceId: string;

  private instance: Consul.Consul;

  get consul(): Consul.Consul {
    return this.instance;
  }

  private selectRandomService(arr: Array<any>) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr[Math.floor(Math.random() * arr.length)];
  }

  @Init()
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  private async autoRegister() {
    try {
      this.instance = new Consul(this.config.options);
      const { register } = this.config;
      if (register) {
        const { id, name, port, address, check, checks } = register;
        // 如果没有配置健康监测,则视为顶层为web主框架,同时使用内置http的/health为健康检查的接口
        if (!check && !checks?.length) {
          register.check = {
            http: `http://${address}:${port}/health`,
            interval: '5s',
            ttl: '30s',
          };
        }
        this.serviceId = id;
        if (!this.serviceId) {
          const serviceName = name || this.infoSrv.getPkg().name;
          this.serviceId = `${serviceName}:${address}:${port}`;
          Object.assign(register, {
            id: this.serviceId,
            name: serviceName,
          });
        }
        await this.instance.agent.service.register(register);
      }
    } catch (e) {
      throw new MidwayConsulError(`Service startup failure: ${e.message}`);
    }
  }

  private async loadService(
    serviceName: string,
    dc?: string
  ): Promise<IService> {
    const result: Array<IServiceHealth> = await this.instance.health.checks(
      serviceName
    );
    if (!result.length) {
      throw new MidwayConsulError(
        `no available service instance named ${serviceName}`
      );
    }
    const availableIns: Array<IServiceHealth> = result.filter(
      service => service.Status === 'passing'
    );
    if (!availableIns.length) {
      throw new MidwayConsulError(
        `${serviceName} The health status of services is abnormal`
      );
    }
    const list = (await this.instance.agent.service.list()) as {
      [props: string]: IService;
    };
    const iServices = Object.values(list);
    if (!iServices.length) {
      throw new MidwayConsulError(
        `no available service instance named ${serviceName}`
      );
    }
    const services = dc
      ? iServices.filter(info => {
          return info.Service === serviceName && info.Datacenter === dc;
        })
      : iServices.filter(info => {
          return info.Service === serviceName;
        });
    return this.selectRandomService(services);
  }

  /**
   * Select an available service instance by name and datacenter
   * @param {string} serviceName the service name
   * @param {string} dc datacenter
   */
  async select(serviceName: string, dc?: string) {
    return this.loadService(serviceName, dc);
  }

  async kvSet(
    key: string,
    value: string | Buffer,
    options?: Consul.Kv.SetOptions
  ): Promise<boolean> {
    const opt = options || {};
    return this.instance.kv.set({ ...opt, key, value });
  }

  async kvGet(key: string, options?: Consul.Kv.GetOptions): Promise<IKvKey> {
    const opt = options || {};
    try {
      return await this.instance.kv.get({ ...opt, key });
    } catch (e) {
      throw new MidwayConsulError(e.message);
    }
  }

  async kvGetValue(
    key: string,
    options?: Consul.Kv.GetOptions
  ): Promise<string> {
    const opt = options || {};
    try {
      const result: Array<IKvKey> = await this.instance.kv.get({
        ...opt,
        key,
      });
      if (!result?.length) return undefined;
      return result[0].Value;
    } catch (e) {
      throw new MidwayConsulError(e.message);
    }
  }

  async kvKeys(
    key: string,
    options?: Consul.Kv.KeysOptions
  ): Promise<Array<string>> {
    try {
      const opt = options || {};
      return await this.instance.kv.keys({ ...opt, key });
    } catch (e) {
      const { statusCode, statusMessage } = e.response;
      if (statusCode === 404) {
        return [];
      }
      throw new MidwayConsulError(e.message || statusMessage);
    }
  }

  async kvDelete(
    key: string,
    options?: Consul.Kv.DeleteOptions
  ): Promise<boolean> {
    const opt = options || {};
    try {
      await this.instance.kv.delete({ ...opt, key });
      return true;
    } catch (e) {
      throw new MidwayConsulError(e.message);
    }
  }

  @Destroy()
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  private async autoDeregister() {
    try {
      const { deregister } = this.config;
      if (this.serviceId && deregister !== false) {
        await this.instance?.agent.service.deregister(this.serviceId);
      }
    } catch (e) {
      throw new MidwayConsulError(e.message);
    }
  }
}
