export interface MFunctions {
  name: string;
  handler: string;
  events: {
    type: string;
    method: string;
    path: string;
  }[];
}

export interface S3UploadResult {
  ETag: string;
  ServerSideEncryption?: string;
  Location: string;
  Key: string;
  Bucket: string;
}

export interface LambdaFunctionOptions {
  name: string;
  handler?: string;
  runtime?: string;
  description?: string;
  memorySize?: number;
  timeout?: number;
  codeBucket: string;
  codeKey: string;
  path: string;
  stage?: string;
}

export interface StackEvents {
  ResponseMetadata: {
    RequestId: string;
  };
  StackEvents: Array<{
    StackId: string;
    EventId: string;
    StackName: string;
    LogicalResourceId: string;
    PhysicalResourceId: string;
    ResourceType: string;
    Timestamp: string;
    ResourceStatus: string;
    ResourceProperties?: string;
    ClientRequestToken: string;
  }>;
}

export interface StackResourcesDetail {
  ResponseMetadata: {
    RequestId: string;
  };
  StackResources: {
    StackName: string;
    StackId: string;
    LogicalResourceId: string;
    PhysicalResourceId: string;
    ResourceType: string;
    LastUpdatedTimestamp: string;
    ResourceStatus: string;
    Metadata: string;
    DriftInformation: {
      StackResourceDriftStatus: string;
    };
  }[];
}
