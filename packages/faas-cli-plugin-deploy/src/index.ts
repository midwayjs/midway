import { BasePlugin, ICoreInstance } from '@midwayjs/fcli-command-core';
import { commonPrefix } from './utils';
export class DeployPlugin extends BasePlugin {
  core: ICoreInstance;
  options: any;
  commands = {
    deploy: {
      usage: 'Deploy to online',
      lifecycleEvents: ['deploy'],
      options: {},
    },
  };

  constructor(core, options) {
    super(core, options);
    this.assignAggregationToFunctions();
  }

  // 合并高密度部署
  assignAggregationToFunctions() {
    // 只在部署阶段生效
    if (!this.core.processedInput.commands || !this.core.processedInput.commands.length || this.core.processedInput.commands[0] !== 'deploy') {
      return;
    }
    if (
      !this.core.service.aggregation ||
      !this.core.service.functions
    ) {
      return;
    }

    if (
      !this.core.service.custom ||
      !this.core.service.custom.customDomain ||
      !this.core.service.custom.customDomain.domainName
    ) {
      console.warn(
        'If using aggregation deploy, please configure custom domain'
      );
      return;
    }

    this.core.cli.log('Aggregation Deploy');
    const allAggregationPaths = [];
    for (const aggregationName in this.core.service.aggregation) {
      const aggregationFuncName = `aggregation${aggregationName}`;
      this.core.service.functions[
        aggregationFuncName
      ] = this.core.service.aggregation[aggregationName];
      this.core.service.functions[
        aggregationFuncName
      ].handler = `${aggregationFuncName}.handler`;
      this.core.service.functions[
        aggregationFuncName
      ]._isAggregation = true;
      if (!this.core.service.functions[aggregationFuncName].events) {
        this.core.service.functions[aggregationFuncName].events = [];
      }
      // 忽略原始方法，不再单独进行部署
      const deployOrigin = this.core.service.aggregation[aggregationName]
        .deployOrigin;

      const allPaths = [];
      let handlers = [];
      if (this.core.service.aggregation[aggregationName].functions) {
        handlers = this.core.service.aggregation[
          aggregationName
        ].functions
          .map((functionName: string) => {
            const functions = this.core.service.functions;
            const func = functions[functionName];
            if (!func || !func.events) {
              return;
            }
            const httpEventIndex = func.events.findIndex(
              (event: any) => !!event.http
            );
            if (httpEventIndex === -1) {
              return;
            }
            const httpEvent = func.events[httpEventIndex];
            if (!httpEvent || !httpEvent.http.path) {
              return;
            }
            allPaths.push(httpEvent.http.path);
            if (!deployOrigin) {
              // 不把原有的函数进行部署
              this.core.service.functions[functionName]._ignore = true;
            }
            return {
              path: httpEvent.http.path,
              handler: func.handler,
            };
          })
          .filter((func: any) => !!func);
      }

      let currentPath = commonPrefix(allPaths);
      currentPath = currentPath ? `${currentPath}/*` : '/*';
      this.core.cli.log(
        ` - using '${currentPath}' to deploy '${allPaths.join(`', '`)}'`
      );
      if (allAggregationPaths.indexOf(currentPath) !== -1) {
        console.error(
          `Cannot use the same prefix '${currentPath}' for aggregation deployment`
        );
        process.exit();
      }
      allAggregationPaths.push(currentPath);
      this.core.service.functions[
        aggregationFuncName
      ]._handlers = handlers;
      this.core.service.functions[aggregationFuncName].events = [
        { http: { method: 'get', path: currentPath } },
      ];
    }
  }
}
