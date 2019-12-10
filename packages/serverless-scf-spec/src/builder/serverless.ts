import {
  FunctionStructure,
  HTTPEvent,
  ProviderStructure,
  ScheduleEvent,
  SpecBuilder,
} from '@midwayjs/spec-builder';
import { SCFFunctionsStructure, SCFHTTPEventType } from '../interface/template';
import {
  ApiGateway,
  Ckafka,
  Cmq,
  Cos,
  SCFServerlessFunctionSpec,
  SCFServerlessSpec,
  Timer,
} from '../interface/serverless';

export class SCFServerlessSpecBuilder extends SpecBuilder {
  toJSON() {
    const providerData: ProviderStructure = this.getProvider();
    const serviceData = this.getService();
    const functionsData: SCFFunctionsStructure = this.getFunctions();
    const serviceName = serviceData.name;

    const runtime = providerData.runtime || 'Nodejs8.9';
    const timeout = providerData.timeout || 30;
    const memorySize = providerData.memorySize || 128;

    const serverless: SCFServerlessSpec = {
      service: serviceName,
      provider: {
        name: 'tencent',
        runtime,
        region: providerData.region,
        credentials: (providerData as any).credentials,
        stage: providerData.stage,
        memorySize,
        environment: {
          variables: providerData.environment,
        },
        timeout,
      },
      plugins: ['serverless-tencent-scf'],
      functions: {},
    };

    for (const funName in functionsData) {
      const funSpec: FunctionStructure = functionsData[funName];

      const functionTemplate: SCFServerlessFunctionSpec = {
        handler: funSpec.handler || 'index.main_handler',
        description: funSpec.description || '',
        runtime: funSpec.runtime || runtime,
        timeout: funSpec.timeout || timeout,
        memorySize: funSpec.memorySize || memorySize,
        environment: {
          variables: funSpec.environment || {},
        },
        events: [],
      };

      for (const event of funSpec['events']) {
        if (event['http']) {
          const evt = event['http'] as HTTPEvent;
          const apiGateway: ApiGateway = {
            name: `${funName}_${providerData.stage || ''}_apigw`,
            parameters: {
              httpMethod: convertMethods(evt.method),
              path: evt.path,
              serviceTimeout: funSpec.timeout || timeout,
              stageName: providerData.stage,
              serviceId:
                (providerData as any).serviceId || (evt as any).serviceId,
              integratedResponse: true,
            },
          };

          functionTemplate.events.push({
            apigw: apiGateway,
          });
        }

        if (event['schedule']) {
          const evt = event['schedule'] as ScheduleEvent;
          const timer: Timer = {
            name: 'timer',
            parameters: {
              cronExpression: evt.value,
              enable: true,
            },
          };

          functionTemplate.events.push({
            timer,
          });
        }

        if (event['cos']) {
          const cos = event['cos'] as Cos;
          functionTemplate.events.push({ cos });
        }

        if (event['cmq']) {
          const cmq = event['cmq'] as Cmq;
          functionTemplate.events.push({ cmq });
        }

        if (event['ckafka']) {
          const ckafka = event['ckafka'] as Ckafka;
          functionTemplate.events.push({ ckafka });
        }
      }

      serverless.functions[funName] = functionTemplate;
    }

    return serverless;
  }
}

function convertMethods(method: string | string[]): SCFHTTPEventType {
  if (Array.isArray(method)) {
    method = method[0];
  }

  return method.toUpperCase() as SCFHTTPEventType;
}
