import {
  HTTPEvent,
  ProviderStructure,
  ScheduleEvent,
  SpecBuilder,
} from '../../';
import {
  SCFFunctionSpec,
  SCFFunctionsStructure,
  SCFFunctionStructure,
  SCFHTTPEventType,
  SCFTemplateSpec,
} from '../interface/template';

export class SCFTemplateSpecBuilder extends SpecBuilder {
  toJSON() {
    const providerData: ProviderStructure = this.getProvider();
    const serviceData = this.getService();
    const functionsData: SCFFunctionsStructure = this.getFunctions();
    const serviceName = serviceData.name;

    const template: SCFTemplateSpec = {
      Globals: {
        Function: {
          Runtime: providerData.runtime || 'Nodejs8.9',
          Timeout: providerData.timeout || 30,
          Handler: 'index.main_handler',
          Environment: providerData.environment,
        },
      },
      Resources: {
        default: {
          Type: 'TencentCloud::Serverless::Namespace',
        },
      },
    };

    const httpEventRouters = {};

    for (const funName in functionsData) {
      const funSpec: SCFFunctionStructure = functionsData[funName];

      const functionTemplate: SCFFunctionSpec = {
        Type: 'TencentCloud::Serverless::Function',
        Properties: {
          Description: funSpec.description || '',
          Handler: funSpec.handler || 'index.main_handler',
          Runtime: funSpec.runtime || providerData.runtime || 'Nodejs8.9',
          CodeUri: funSpec.codeUri || '.',
          Timeout: funSpec.timeout || providerData.timeout || 30,
          MemorySize: funSpec.memorySize || providerData.memorySize || 512,
          Type: 'Event',
          Events: {},
        },
      };

      for (const event of funSpec['events']) {
        // HTTP
        if (event['http']) {
          const evt = event['http'] as HTTPEvent;
          functionTemplate.Properties.Events['http_' + evt.path + '_apigw'] = {
            Type: 'APIGW',
            Properties: {
              StageName: providerData.stage,
              ServiceId: funSpec.serviceId,
              HttpMethod: convertMethods(evt.method),
              Enable: true,
              IntegratedResponse: true,
            },
          };

          httpEventRouters[evt.path] = {
            serviceName,
            functionName: funName,
          };
        }

        // 定时器
        if (event['schedule']) {
          const evt = event['schedule'] as ScheduleEvent;
          functionTemplate.Properties.Events['schedule'] = {
            Type: 'Timer',
            Properties: {
              CronExpression: evt.value,
              Enable: true,
              Message: evt.payload,
            },
          };
        }
      }

      template.Resources.default[funSpec.name || funName] = functionTemplate;
    }

    return template;
  }
}

function convertMethods(method: string | string[]): SCFHTTPEventType {
  if (Array.isArray(method)) {
    method = method[0];
  }

  return method.toUpperCase() as SCFHTTPEventType;
}
