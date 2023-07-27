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
import { IConsulOptions, IServiceHealth, IServiceNode } from './interface';

export class MidwayConsulError extends MidwayError {
  constructor(message: string) {
    super(message);
  }
}

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
        const serviceName = name || this.infoSrv.getPkg().name;
        this.serviceId = id;
        if (!this.serviceId) {
          this.serviceId = `${serviceName}:${address}:${port}`;
        }
        Object.assign(register, {
          id: this.serviceId,
          name: serviceName,
        });
        await this.instance.agent.service.register(register);
      }
    } catch (e) {
      throw new MidwayConsulError(`Service startup failure: ${e.message}`);
    }
  }

  private async loadAllService(
    options: Consul.Catalog.Service.NodesOptions
  ): Promise<Array<IServiceNode>> {
    const services: Array<IServiceNode> =
      await this.instance.catalog.service.nodes(options);
    if (!services.length) {
      throw new MidwayConsulError(
        `no available service instance named ${options.service}`
      );
    }
    return services;
  }

  /**
   * Select an available service instance by name and datacenter
   * @param {string} serviceName the service name
   * @param {Consul.Catalog.Service.NodesOptions} options the NodesOptions
   */
  async select(
    serviceName: string,
    options?: Omit<Consul.Catalog.Service.NodesOptions, 'service'>
  ) {
    const checkOpt = options || {};
    let checkedArr: Array<IServiceHealth>;
    try {
      checkedArr = await this.instance.health.checks({
        ...checkOpt,
        service: serviceName,
      });
    } catch (e) {
      if (e?.response?.statusCode === 404) {
        checkedArr = [];
      } else {
        throw new MidwayConsulError(e.message);
      }
    }
    if (!checkedArr.length) {
      throw new MidwayConsulError(
        `no available service instance named ${serviceName}`
      );
    }
    const passed: Array<IServiceHealth> = checkedArr.filter(
      service => service.Status === 'passing'
    );
    if (!passed.length) {
      throw new MidwayConsulError(
        `The health status of services ${serviceName}  is abnormal`
      );
    }
    const opt = options || {};
    const allNodes = await this.loadAllService({
      ...opt,
      service: serviceName,
    });
    const matched = allNodes.filter(r => {
      return passed.some(a => a.ServiceID === r.ServiceID);
    });
    if (!matched.length) {
      throw new MidwayConsulError(
        `no available service instance named ${serviceName}`
      );
    }
    return this.selectRandomService(matched) as IServiceNode;
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
