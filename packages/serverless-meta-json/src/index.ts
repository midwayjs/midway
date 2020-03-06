import { basename } from 'path';
import { readdirSync } from 'fs';
import { IGateway, IOptions, IPathMethodInfo, IPathInfo, ITriggerItem } from './inter';
export const generator = async (options: IOptions) => {

  const {
    yamlData,
    extra,
    archivePaths,
    archiveDirPath,
    generatorArchivePath
  } = options;
  let {
    archiveType
  } = options;
  archiveType = archiveType || 'zip';
  const gateway: IGateway = {
    kind: 'simple-mapping',
    paths: {}
  };
  if (yamlData.custom && yamlData.custom.customDomain && yamlData.custom.customDomain.domainName) {
    gateway['x-gateway-domain'] = yamlData.custom.customDomain.domainName;
  }
  const group: string = yamlData.service.name;
  const prefix: string = yamlData.service.fnPrefix ? `${yamlData.service.fnPrefix}-` : '';

  let infos = [];
  if (archivePaths && archivePaths.length) {
    archivePaths.forEach((archivePath) => {
      if (archivePath.indexOf(`.${archiveType}`) === -1) {
        return;
      }
      infos.push({
        name: basename(archivePath).replace(`.${archiveType}`, ''),
        archivePath
      });
    });
  } else {
    infos = Object.keys(yamlData.functions).map((name: string) => {
      return {
        name,
        archivePath: generatorArchivePath ? generatorArchivePath(yamlData.functions[name]) : `${name}.${archiveType}`
      };
    });
  }
  const functions = infos.map((info: { name: string, archivePath?: string}) => {
    const { name, archivePath } = info;
    const funcInfo = yamlData.functions[name];
    const handler = funcInfo.handler;
    const trigger = funcInfo.events || [];
    const setGateway = (pathInfo: IPathInfo) => {
      if (!pathInfo || !pathInfo.path) {
        return;
      }
      const methodInfo: IPathMethodInfo = {};
      let methods: string[] = pathInfo.method ? [].concat(pathInfo.method) : [];
      if (!methods.length) {
        methods = ['all'];
      }
      methods.forEach((method: string) => {
        methodInfo[method.toUpperCase()] = {
          'x-gateway-intergration': {
            type: 'function',
            url: {
              group,
              name: `${prefix}${name}`,
              version: 'latest'
            }
          }
        };
      });
      gateway.paths[pathInfo.path] = methodInfo;
    };

    trigger.forEach((triggerItem: ITriggerItem) => {
      Object.keys(triggerItem).forEach((triggerType: string) => {
        if (triggerType === 'http') {
          setGateway(triggerItem[triggerType]);
        }
      });
    });

    // for aggregation
    if (funcInfo._allAggred) {
      funcInfo._allAggred.forEach((pathInfo: IPathInfo) => {
        setGateway(pathInfo);
      });
    }

    return {
      name,
      archive: (archiveDirPath || './') + archivePath,
      handler,
      trigger,
      ...extra,
    };
  });

  return {
    'spec-version': '1.0.0',
    functions,
    gateway,
  };
};

export const simpleGenerator = async (archivesPath: string, yamlData: any, extra?: any) => {
  const archivePaths = readdirSync(archivesPath);
  return generator({
    yamlData,
    archivePaths,
    archiveDirPath: './archives/',
    extra
  });
};
