import { Inject, Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';
import { ViewManager } from './viewManager';
import { MidwayApplicationManager } from '@midwayjs/core';
import { ContextView } from './contextView';

const VIEW = Symbol('Context#view');

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
              return this.renderView(...args).then(body => {
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
              return this.view.render(...args);
            },
          },

          /**
           * Render template string, same as {@link @ContextView#renderString}
           * @return {Promise} result
           */
          renderString: {
            value: async function (...args) {
              return this.view.renderString(...args);
            },
          },

          /**
           * View instance that is created every request
           * @member {ContextView} Context#view
           */
          view: {
            get() {
              if (!this[VIEW]) {
                this[VIEW] = this.requestContext.get(ContextView);
              }
              return this[VIEW];
            },
          },
        });
      });

    await container.getAsync(ViewManager);
  }
}
