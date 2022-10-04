import {
  Inject,
  Configuration,
  MidwayApplicationManager,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';
import { ViewManager } from './viewManager';
import { ContextView } from './contextView';

@Configuration({
  namespace: 'view',
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
    },
  ],
})
export class ViewConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady(container) {
    this.applicationManager
      .getApplications(['koa', 'egg', 'faas'])
      .forEach((app: any) => {
        Object.defineProperties(app.context, {
          /**
           * Render a file, then set to body, the parameter is same as {@link @ContextView#render}
           * @return {Promise} result
           */
          render: {
            value: async function (...args) {
              const contextView = await this.requestContext.getAsync(
                ContextView
              );
              return contextView.render(...args).then(body => {
                this.body = body;
              });
            },
          },

          /**
           * Render a file, same as {@link @ContextView#render}
           * @return {Promise} result
           */
          renderView: {
            value: async function (...args) {
              const contextView = await this.requestContext.getAsync(
                ContextView
              );
              return contextView.render(...args);
            },
          },

          /**
           * Render template string, same as {@link @ContextView#renderString}
           * @return {Promise} result
           */
          renderString: {
            value: async function (...args) {
              const contextView = await this.requestContext.getAsync(
                ContextView
              );
              return contextView.renderString(...args);
            },
          },
        });
      });

    await container.getAsync(ViewManager);
  }
}
