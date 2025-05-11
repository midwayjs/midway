import {
  Configuration,
  ILifeCycle,
  ILogger,
  IMidwayApplication,
  IMidwayContainer,
  Inject,
  LifeCycleInvokeOptions,
  Logger,
  MidwayApplicationManager,
  MidwayConfigService,
  MidwayWebRouterService,
} from '@midwayjs/core';
import { ConsulServiceFactory } from './manager';
import { ConsulServiceDiscovery } from './extension/serviceDiscovery';
import { ConsulServiceDiscoveryOptions } from './interface';
import {
  calculateTTL,
  HTTPHealthCheck,
  TCPHealthCheck,
  TTLHeartbeat,
} from './extension/helper';

@Configuration({
  namespace: 'consul',
  importConfigs: [
    {
      default: {
        consul: {
          serviceDiscovery: {
            selfRegister: false,
            loadBalancer: 'roundRobin',
            healthCheckType: 'self',
          },
        },
      },
    },
  ],
})
export class ConsulConfiguration implements ILifeCycle {
  @Inject()
  private configService: MidwayConfigService;

  @Logger()
  private coreLogger: ILogger;

  @Inject()
  private applicationManager: MidwayApplicationManager;

  private isSelfRegister = false;

  private ttlHeartbeat?: TTLHeartbeat;

  private httpHealthCheck?: HTTPHealthCheck;

  private tcpHealthCheck?: TCPHealthCheck;

  async onReady(
    container: IMidwayContainer,
    app?: IMidwayApplication
  ): Promise<void> {
    await container.getAsync(ConsulServiceFactory);
  }

  async onServerReady(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ): Promise<void> {
    const config = this.configService.getConfiguration(
      'consul.serviceDiscovery'
    ) as ConsulServiceDiscoveryOptions;
    if (config.selfRegister) {
      this.coreLogger.info(
        '[midway:consul] start to register current node to service discovery'
      );
      const serviceDiscovery = await container.getAsync(ConsulServiceDiscovery);
      await serviceDiscovery.register();
      this.isSelfRegister = true;
      if (config.autoHealthCheck) {
        const instance = serviceDiscovery.getAdapter().getSelfInstance();

        if (instance['check']?.['ttl']) {
          this.ttlHeartbeat = new TTLHeartbeat({
            consul: serviceDiscovery.getServiceDiscoveryClient(),
            checkId: `service:${instance.id}`,
            interval: calculateTTL(instance['check']['ttl']),
          });
          this.ttlHeartbeat.start();
        } else if (instance['check']?.['http']) {
          // 这里要判断下是否启动了 http 服务
          const applications = this.applicationManager.getApplications([
            'egg',
            'koa',
            'express',
          ]);
          if (applications.length !== 0) {
            const webRouterService = await container.getAsync(
              MidwayWebRouterService
            );
            const url = new URL(instance['check']['http']);
            webRouterService.addRouter(
              async _ => {
                return 'success';
              },
              {
                url: url.pathname,
                requestMethod: 'GET',
              }
            );
          } else {
            this.httpHealthCheck = new HTTPHealthCheck(
              instance['check']['http']
            );
            this.httpHealthCheck.start();
          }
        } else if (instance['check']?.['tcp']) {
          this.tcpHealthCheck = new TCPHealthCheck(instance['check']['tcp']);
          this.tcpHealthCheck.start();
        }
      }
    }
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    if (this.isSelfRegister) {
      const serviceDiscovery = await container.getAsync(ConsulServiceDiscovery);
      await serviceDiscovery.deregister();
    }

    if (this.ttlHeartbeat) {
      this.ttlHeartbeat.stop();
    }

    if (this.httpHealthCheck) {
      this.httpHealthCheck.stop();
    }

    if (this.tcpHealthCheck) {
      this.tcpHealthCheck.stop();
    }

    const factory = await container.getAsync(ConsulServiceFactory);
    await factory.stop();
  }
}
