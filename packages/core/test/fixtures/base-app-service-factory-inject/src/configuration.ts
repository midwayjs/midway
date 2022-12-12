import { App, Configuration, InjectClient, Provide, ServiceFactory, IMidwayApplication, Init } from '../../../../src';

@Provide()
export class ServiceFactoryA extends ServiceFactory<any> {
  protected createClient(config, clientName): any {
  }

  getName(): string {
    return '';
  }
}

@Provide()
export class ServiceFactoryB extends ServiceFactory<any> {

  @Init()
  async init() {
    await this.initClients({
      clients: {
        default1: {}
      }
    })
  }

  protected createClient(config, clientName): any {
    return {
      data: clientName,
    }
  }

  getName(): string {
    return '';
  }
}

@Provide()
export class ServiceFactoryC extends ServiceFactory<any> {

  @Init()
  async init() {
    await this.initClients({
      clients: {
        default1: {},
        default2: {}
      },
      defaultClientName: 'default2'
    })
  }

  protected createClient(config, clientName): any {
    return {
      data: clientName,
    }
  }

  getName(): string {
    return '';
  }
}

@Provide()
export class A {
  @InjectClient(ServiceFactoryA)
  clientA;

  @InjectClient(ServiceFactoryB, 'default1')
  clientB;

  @InjectClient(ServiceFactoryC)
  clientC;

  @InjectClient(ServiceFactoryA, 'custom1')
  clientD;

  invokeA() {
    return this.clientA;
  }

  invokeB() {
    return this.clientB;
  }

  invokeC() {
    return this.clientC;
  }

  invokeD() {
    return this.clientD;
  }
}


@Configuration()
export class AutoConfiguration {

  @App()
  app: IMidwayApplication;

  async onReady(container) {
    await container.getAsync(ServiceFactoryA);
    await container.getAsync(ServiceFactoryB);
    await container.getAsync(ServiceFactoryC);
  }
}
