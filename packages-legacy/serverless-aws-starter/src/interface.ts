export interface AWSContext {
  functionName: string; // The name of the Lambda function.
  functionVersion: string; // The version of the function.
  invokedFunctionArn: string; // The Amazon Resource Name (ARN) that's used to invoke the function. Indicates if the invoker specified a version number or alias.
  memoryLimitInMB: string; // The amount of memory that's allocated for the function.
  awsRequestId: string; // The identifier of the invocation request.
  logGroupName: string; // The log group for the function.
  logStreamName: string; // The log stream for the function instance.

  identity: {
    cognitoIdentityId: string; // The authenticated Amazon Cognito identity.
    cognitoIdentityPoolId: string; // The Amazon Cognito identity pool that authorized the invocation.
  }; // (mobile apps) Information about the Amazon Cognito identity that authorized the request.

  clientContext: {
    client: {
      installation_id: string;
      app_title: string;
      app_version_name: string;
      app_version_code: string;
      app_package_name: string;
    };

    env: {
      platform_version: string;
      platform: string;
      make: string;
      model: string;
      locale: string;
    };

    Custom: any; // Custom values that are set by the mobile application.
  }; // (mobile apps) Client context that's provided to Lambda by the client application.

  callbackWaitsForEmptyEventLoop: string; // Set to false to send the response right away when the callback executes, instead of waiting for the Node.js event loop to be empty. If this is false, any outstanding events continue to run during the next invocation.

  getRemainingTimeInMillis(): number; // Returns the number of milliseconds left before the execution times out
}

export interface AWSBasicHTTPEvent {
  body: any;
  path: string;
  httpMethod: string;
  isBase64Encoded: boolean;
  queryStringParameters: { [key: string]: string };
  headers: { [key: string]: string };
}

export interface AWSHTTPEvent extends AWSBasicHTTPEvent {
  resource: string;
  multiValueQueryStringParameters: { [key: string]: string[] };
  pathParameters: { [key: string]: string };
  stageVariables: { [key: string]: string };
  multiValueHeaders: { [key: string]: string[] };
  requestContext: {
    accountId: string;
    resourceId: string;
    stage: string;
    requestId: string;
    requestTime: string;
    requestTimeEpoch: number;
    identity: {
      cognitoIdentityPoolId: any; // TODO
      accountId: string;
      cognitoIdentityId: string;
      caller: any; // TODO
      accessKey: string;
      sourceIp: string;
      cognitoAuthenticationType: any; // TODO
      cognitoAuthenticationProvider: any; // TODO
      userArn: string;
      userAgent: string;
      user: string;
    };
    path: string;
    resourcePath: string;
    httpMethod: string;
    apiId: string;
    protocol: string;
  };
}
