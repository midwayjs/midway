import {
  Configuration,
  ILifeCycle,
  IMidwayContainer,
  Inject,
  MidwayApplicationManager,
  MidwayConfigService,
} from '@midwayjs/core';
import { GraphQLService } from '@midwayjs/graphql';
import * as DefaultConfig from './config/config.default';
import { ApolloConfigurationOptions } from './interface';
import { ApolloService } from './apolloService';

@Configuration({
  namespace: 'apollo',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class ApolloConfiguration implements ILifeCycle {
  private serverRecords: Array<{
    app: any;
    server: any;
    schema: any;
    subscriptionServer?: any;
  }> = [];

  @Inject()
  applicationManager: MidwayApplicationManager;

  @Inject()
  configService: MidwayConfigService;

  @Inject()
  graphqlService: GraphQLService;

  @Inject()
  apolloService: ApolloService;

  async onReady(container: IMidwayContainer) {
    const config =
      this.configService.getConfiguration<ApolloConfigurationOptions>('apollo');
    const apps = this.applicationManager.getApplications(['koa', 'express']);

    if (!apps.length) {
      return;
    }

    const resolvers = this.graphqlService.buildResolvers(config, container);
    const baseDir = container.get<string>('baseDir');

    for (const app of apps) {
      const schema = this.apolloService.createSchema(
        config,
        resolvers,
        baseDir
      );
      const server = await this.apolloService.createServer(config, schema);
      const middleware = this.apolloService.createMiddleware(
        server,
        config,
        app.getNamespace() === 'express'
      );
      app.useMiddleware(middleware as any);
      this.serverRecords.push({
        app,
        server,
        schema,
      });
    }
  }

  async onServerReady() {
    const config =
      this.configService.getConfiguration<ApolloConfigurationOptions>('apollo');
    for (const record of this.serverRecords) {
      record.subscriptionServer = this.apolloService.createSubscriptionServer(
        record.schema,
        config,
        record.app
      );
    }
  }

  async onStop() {
    for (const record of this.serverRecords) {
      if (record.subscriptionServer) {
        await this.apolloService.stopSubscriptionServer(
          record.subscriptionServer
        );
      }
      await this.apolloService.stop(record.server);
    }
    this.serverRecords = [];
  }
}
