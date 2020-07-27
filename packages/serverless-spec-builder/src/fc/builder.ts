import {
  FCCustomDomainSpec,
  FCFunctionSpec,
  FCFunctionsStructure,
  FCFunctionStructure,
  FCSpec,
  HTTPEventType,
  FCProviderStructure,
} from './interface';
import { SpecBuilder } from '../builder';
import {
  HTTPEvent,
  TimerEvent,
  LogEvent,
  OSEvent,
  MQEvent,
} from '../interface';
import {
  uppercaseObjectKey,
  removeObjectEmptyAttributes,
  filterUserDefinedEnv,
} from '../utils';

export class FCSpecBuilder extends SpecBuilder {
  toJSON() {
    const providerData: FCProviderStructure = this.getProvider();
    const serviceData = this.getService();
    const functionsData: FCFunctionsStructure = this.getFunctions();
    const serviceName = serviceData.name;
    const userDefinedEnv = filterUserDefinedEnv();

    const template: FCSpec = {
      ROSTemplateFormatVersion: '2015-09-01',
      Transform: 'Aliyun::Serverless-2018-04-03',
      Resources: {
        [`${serviceName}`]: {
          Type: 'Aliyun::Serverless::Service',
          Properties: {
            Description: serviceData.description,
            Role: providerData.role,
            InternetAccess: providerData.internetAccess,
            VpcConfig: uppercaseObjectKey(providerData.vpcConfig),
            Policies: uppercaseObjectKey(providerData.policies),
            LogConfig: uppercaseObjectKey(providerData.logConfig),
            NasConfig: uppercaseObjectKey(providerData.nasConfig),
          },
        },
      },
    };

    const httpEventRouters = {};

    for (const funName in functionsData) {
      const funSpec: FCFunctionStructure = functionsData[funName];
      const handler = funSpec.handler || 'index.handler';
      const functionTemplate: FCFunctionSpec = {
        Type: 'Aliyun::Serverless::Function',
        Properties: {
          Description: funSpec.description || '',
          Initializer:
            funSpec.initializer ||
            handler.split('.').slice(0, -1).join('.') + '.initializer',
          Handler: handler,
          Runtime: funSpec.runtime || providerData.runtime || 'nodejs10',
          CodeUri: funSpec.codeUri || '.',
          Timeout: funSpec.timeout || providerData.timeout || 3,
          InitializationTimeout:
            funSpec.initTimeout || providerData.initTimeout || 3,
          MemorySize: funSpec.memorySize || providerData.memorySize || 128,
          EnvironmentVariables: {
            ...providerData.environment,
            ...funSpec.environment,
            ...userDefinedEnv,
          },
          InstanceConcurrency: funSpec.concurrency || 1,
        },
        Events: {},
      };

      for (const event of funSpec?.['events'] ?? []) {
        if (event['http']) {
          const evt = event['http'] as HTTPEvent;
          functionTemplate.Events[evt.name || 'http-' + funName] = {
            Type: 'HTTP',
            Properties: {
              AuthType: 'ANONYMOUS', // 先写死
              Methods: convertMethods(evt.method),
              InvocationRole: evt.role,
              Qualifier: evt.version,
            },
          };

          httpEventRouters[evt.path] = {
            serviceName,
            functionName: funSpec.name || funName,
          };
        }

        if (event['timer']) {
          const evt = event['timer'] as TimerEvent;

          functionTemplate.Events[evt.name || 'timer'] = {
            Type: 'Timer',
            Properties: {
              CronExpression:
                evt.type === 'every' ? `@every ${evt.value}` : evt.value,
              Enable: evt.enable === false ? false : true,
              Payload: evt.payload,
              Qualifier: evt.version,
            },
          };
        }

        if (event['log']) {
          const evt = event['log'] as LogEvent;
          functionTemplate.Events[evt.name || 'log'] = {
            Type: 'Log',
            Properties: {
              SourceConfig: {
                Logstore: evt.source,
              },
              JobConfig: {
                MaxRetryTime: evt.retryTime || 1,
                TriggerInterval: evt.interval || 30,
              },
              LogConfig: {
                Project: evt.project,
                Logstore: evt.log,
              },
              Enable: true,
              InvocationRole: evt.role,
              Qualifier: evt.version,
            },
          };
        }

        const osEvent = event['os'] || event['oss'] || event['cos'];

        if (osEvent) {
          const evt = osEvent as OSEvent;
          functionTemplate.Events[evt.name || 'oss'] = {
            Type: 'OSS',
            Properties: {
              BucketName: evt.bucket,
              Events: [].concat(evt.events),
              Filter: {
                Key: {
                  Prefix: evt.filter.prefix,
                  Suffix: evt.filter.suffix,
                },
              },
              Enable: true,
              InvocationRole: evt.role,
              Qualifier: evt.version,
            },
          };
        }

        if (event['mq']) {
          const evt = event['mq'] as MQEvent;
          functionTemplate.Events[evt.name || 'mq'] = {
            Type: 'MNSTopic',
            Properties: {
              TopicName: evt.topic,
              NotifyContentFormat: 'JSON',
              NotifyStrategy: evt.strategy || 'BACKOFF_RETRY',
              Region: evt.region,
              FilterTag: evt.tags,
              InvocationRole: evt.role,
              Qualifier: evt.version,
            },
          };
        }
      }

      template.Resources[serviceName][
        funSpec.name || funName
      ] = functionTemplate;
    }

    if (
      this.originData['custom'] &&
      this.originData['custom']['customDomain']
    ) {
      const domainInfo: {
        domainName: string;
        stage?: string;
      } = this.originData['custom']['customDomain'];
      template.Resources[domainInfo.domainName] = {
        Type: 'Aliyun::Serverless::CustomDomain',
        Properties: {
          Protocol: 'HTTP',
          RouteConfig: {
            routes: httpEventRouters,
          },
        },
      } as FCCustomDomainSpec;
    }

    return removeObjectEmptyAttributes(template);
  }
}

function convertMethods(methods: string | string[]): HTTPEventType[] {
  if (typeof methods === 'string') {
    if (methods === 'any') {
      return ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'];
    }

    methods = [methods];
  } else {
    return ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'];
  }

  return methods.map(method => {
    return method.toUpperCase();
  }) as HTTPEventType[];
}
