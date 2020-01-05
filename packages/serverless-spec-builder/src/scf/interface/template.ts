import { FunctionsStructure, FunctionStructure } from '../../interface';

export interface SCFTemplateSpec {
  Globals?: {
    Function: {
      Runtime?: string;
      Timeout?: number;
      Handler?: string;
      Environment?: {
        Variables?: {
          [key: string]: string;
        };
      };
    };
  };
  Resources: {
    default: Default;
  };
}

export type SCFNameSpaceType = 'TencentCloud::Serverless::Namespace';
export type SCFFunctionType = 'TencentCloud::Serverless::Function';

export interface Default {
  Type: SCFNameSpaceType;

  [resourceName: string]: SCFFunctionSpec | SCFNameSpaceType;
}

export interface SCFFunctionSpec {
  Type?: SCFFunctionType;
  Properties?: {
    CodeUri?: string;
    Type?: string;
    Description?: string;
    Handler?: string;
    MemorySize?: number;
    Runtime?: string;
    Timeout?: number;
    Events?: {
      [key: string]: SCFHTTPEvent | SCFTimerEvent;
    };
  };
}

// ref: https://cloud.tencent.com/document/product/583/36198#api
export interface SCFHTTPEvent {
  Type?: 'APIGW';
  Properties?: {
    Enable?: boolean;
    StageName?: SCFHTTPEventState;
    ServiceId?: string;
    HttpMethod?: SCFHTTPEventType;
    IntegratedResponse: boolean;
  };
}

export type SCFHTTPEventType =
  | 'ANY'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'HEAD';
export type SCFHTTPEventState = 'test' | 'prepub' | 'release' | string;

export interface SCFFunctionStructure extends FunctionStructure {
  codeUri?: string;
  serviceId?: string;
}

export interface SCFFunctionsStructure extends FunctionsStructure {
  [functionName: string]: SCFFunctionStructure;
}

export interface SCFTimerEvent {
  Type: 'Timer';
  Properties: {
    CronExpression: string;
    Enable?: boolean;
    Message?: string;
  };
}
