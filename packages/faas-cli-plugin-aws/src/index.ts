import { render } from 'ejs';
import { join, basename } from 'path';
import { S3, Lambda, CloudFormation, EnvironmentCredentials, SharedIniFileCredentials } from 'aws-sdk';

import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { BasePlugin, ICoreInstance } from '@midwayjs/fcli-command-core';

const fs = require('fs');

const _ = require('lodash');
const readline = require('readline');

const impl = {
  /**
   * Determine whether the given credentials are valid.  It turned out that detecting invalid
   * credentials was more difficult than detecting the positive cases we know about.  Hooray for
   * whak-a-mole!
   * @param credentials The credentials to test for validity
   * @return {boolean} Whether the given credentials were valid
   */
  validCredentials: credentials => {
    let result = false;
    if (credentials) {
      if (
        // 校验 credentials
        (credentials.accessKeyId &&
          credentials.accessKeyId !== 'undefined' &&
          credentials.secretAccessKey &&
          credentials.secretAccessKey !== 'undefined') ||
        // a role to assume has been successfully loaded, the associated STS request has been
        // sent, and the temporary credentials will be asynchronously delivered.
        credentials.roleArn
      ) {
        result = true;
      }
    }
    return result;
  },
  /**
   * Add credentials, if present, to the given results
   * @param results The results to add the given credentials to if they are valid
   * @param credentials The credentials to validate and add to the results if valid
   */
  addCredentials: (results, credentials) => {
    if (impl.validCredentials(credentials)) {
      results.credentials = credentials; // eslint-disable-line no-param-reassign
    }
  },
  /**
   * Add credentials, if present, from the environment
   * @param results The results to add environment credentials to
   * @param prefix The environment variable prefix to use in extracting credentials
   */
  addEnvironmentCredentials: (results, prefix) => {
    if (prefix) {
      const environmentCredentials = new EnvironmentCredentials(prefix);
      impl.addCredentials(results, environmentCredentials);
    }
  },
  /**
   * Add credentials from a profile, if the profile and credentials for it exists
   * @param results The results to add profile credentials to
   * @param profile The profile to load credentials from
   */
  addProfileCredentials: (results, profile) => {
    if (profile) {
      const params: any = { profile };
      if (process.env.AWS_SHARED_CREDENTIALS_FILE) {
        params.filename = process.env.AWS_SHARED_CREDENTIALS_FILE;
      }

      // Setup a MFA callback for asking the code from the user.
      params.tokenCodeFn = (mfaSerial, callback) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(`Enter MFA code for ${mfaSerial}: `, answer => {
          rl.close();
          callback(null, answer);
        });
      };

      const profileCredentials = new SharedIniFileCredentials(params);
      if (
        !(
          profileCredentials.accessKeyId ||
          profileCredentials.sessionToken ||
          (profileCredentials as any).roleArn
        )
      ) {
        throw new Error(`Profile ${profile} does not exist`);
      }

      impl.addCredentials(results, profileCredentials);
    }
  },
  /**
   * Add credentials, if present, from a profile that is specified within the environment
   * @param results The prefix of the profile's declaration in the environment
   * @param prefix The prefix for the environment variable
   */
  addEnvironmentProfile: (results, prefix) => {
    if (prefix) {
      const profile = process.env[`${prefix}_PROFILE`];
      impl.addProfileCredentials(results, profile);
    }
  },
};

interface S3UploadResult {
  ETag: string;
  ServerSideEncryption: string;
  Location: string;
  key: string;
  Bucket: string;
}

interface LambdaFunctionOptions {
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

interface StackEvents {
  ResponseMetadata: {
    RequestId: string;
  };
  StackEvents: Array<
    {
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
    }
  >
}

interface StackRestApiDetail {
  ResponseMetadata: {
    RequestId: string;
  };
  StackResourceDetail: {
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
    }
  }
}

export class AWSLambdaPlugin extends BasePlugin {
  core: ICoreInstance;
  options: any;
  provider = 'aws';
  servicePath = this.core.config.servicePath;
  midwayBuildPath = join(this.servicePath, '.serverless');
  cachedCredentials: Lambda.ClientConfiguration;

  hooks = {
    'package:generateEntry': async () => {
      this.core.cli.log('Generate entry file...');
      this.setGlobalDependencies('@midwayjs/serverless-aws-starter');
      writeWrapper({
        baseDir: this.servicePath,
        service: this.core.service,
        distDir: this.midwayBuildPath,
        starter: '@midwayjs/serverless-aws-starter',
      });
    },
    'deploy:deploy': this.deploy.bind(this),
  };

  async uploadArtifact(bucket: string): Promise<S3UploadResult> {
    const uploadParams = { Bucket: bucket, Key: '', Body: '' };
    const file = join(this.servicePath, 'code.zip');

    const fileStream = fs.createReadableStream(file);
    fileStream.on('error', function (err) {
      console.log('File Error', err);
    });
    uploadParams.Body = fileStream;
    // TODO use prefix by project-function
    uploadParams.Key = basename(file);

    const s3 = new S3({ apiVersion: '2006-03-01' });
    return new Promise((resolve, reject) => {
      s3.upload(uploadParams, (err, data) => {
        if (err) {
          return reject(err);
        } if (data) {
          return resolve(data);
        }
        resolve(null);
      });
    });
  }

  async generateStackJson(handler = 'index.handler', path = '/hello', bucket: string, key: string) {
    const tpl = fs.readFileSync('./resource/aws-stack-http-template.ejs').toString();
    const params: { options: LambdaFunctionOptions } = {
      options: {
        handler, path,
        codeBucket: bucket,
        codeKey: key,
      }
    };
    return render(tpl, params);
  }

  async createStack(credentials, bucket: string, key: string): Promise<{ stackId: string }> {

    // TODO support multi function;
    const names = Object.keys(this.core.service.functions);
    console.log('functions', names);

    /**
     * this.core.service {
     *   service: { name: 'serverless-hello-world' },
     *   provider: { name: 'aws' },
     *   functions: { index: { handler: 'index.handler', events: [Array] } },
     *   package: { artifact: 'code.zip' }
     * }
     */
    const handler = this.core.service.functions[names[0]].handler;

    const service = new CloudFormation(credentials);
    const TemplateBody = await this.generateStackJson(handler, '/hello', bucket, key);
    // const setup = template;
    // const TemplateBody = JSON.stringify(setup);
    const params = {
      StackName: 'my-test-stack',
      OnFailure: 'DELETE',
      // Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND'],
      Parameters: [],
      TemplateBody,
      // Tags: Object.keys(stackTags).map(key => ({ Key: key, Value: stackTags[key] })),
    };

    return new Promise((resolve, reject) => service.createStack(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data as any);
    }));
  }

  async monitorStackResult(credentials, stackId: string, stage = 'v1', path = '/hello') {
    const service = new CloudFormation(credentials);
    const TemplateBody = fs.readFileSync(__dirname + '/temp.yml').toString();
    const params = {
      // LogicalResourceId: "ServerlessRestApi",
      // StackName: 'arn:aws:cloudformation:us-east-1:752677612709:stack/my-test-stack/275319b0-c357-11ea-a1f5-0a99e59b1983'
      StackName: stackId
    };

    while (true) {
      const stackEvents: StackEvents = await new Promise((resolve, reject) =>
        service.describeStackEvents(params, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data as any);
        }));
      const events = stackEvents.StackEvents;
      const lastEvent = events[events.length - 1];
      if (lastEvent && lastEvent.ResourceType === 'ResourceType' && lastEvent.ResourceStatus === 'DELETE_COMPLETE') {
        return Promise.reject('stack deploy failed');
      }
      if (lastEvent && lastEvent.ResourceType === 'ResourceType' && lastEvent.ResourceStatus === 'CREATE_COMPLETE') {
        break;
      }
      // TODO debug log here
      console.log('statue not ready');
      await sleep(1000);
    }

    const result: StackRestApiDetail = await new Promise((resolve, reject) => service.describeStackResources({
      LogicalResourceId: "ServerlessRestApi",
      StackName: stackId
    }, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data as any);
    }));


    // describeStackResources
    // "LogicalResourceId": "ServerlessRestApi",
    // "PhysicalResourceId": "wsqd4ni6i5",
    // staga

    // https://wsqd4ni6i5.execute-api.us-east-1.amazonaws.com/Prod/hello-curl
    const api = `https://${result.StackResourceDetail.LogicalResourceId}.execute-api.${credentials.region}.amazonaws.com/${stage}${path}`;
    return {
      api
    }
  }

  async updateFunction(credentials): Promise<any> {
    const service = new Lambda(credentials);

    // TODO support multi function;
    const names = Object.keys(this.core.service.functions);
    console.log('functions', names);
    const params = {
      FunctionName: names[0],
      ZipFile: join(this.midwayBuildPath, './code.zip'),
    };
    const req = service.updateFunctionCode(params, (err, cfg) => {
      console.log('updateFunctionCode', err, cfg);
    })

    console.log(req.promise);
    const res: any = await req.promise
      ? req.promise()
      : new Promise((resolve, reject) => {
        req.send((err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(res);
        });
      });
    return res;
  }

  async deploy() {
    const stage = 'v1';
    const path = '/hello';

    // 执行 package 打包
    await this.core.invoke(['package'], true, {
      ...this.options,
      skipZip: false, // 生成 zip 包
    });
    this.core.cli.log('Start deploy by aws-sdk');
    const bucket = 'sfprotesthello-dev-serverlessdeploymentbucket-1vxqzgvgdn1is';
    const artifactRes = await this.uploadArtifact(bucket);

    // 配置 crendentials

    /**
     * this.core.service {
     *   service: { name: 'serverless-hello-world' },
     *   provider: { name: 'aws' },
     *   functions: { index: { handler: 'index.handler', events: [Array] } },
     *   package: { artifact: 'code.zip' }
     * }
     */
    const credentials = this.getCredentials();
    credentials.region = this.getRegion();
    console.log('credentials', credentials);

    let stackData: { stackId: string } = null;
    try {
      stackData = await this.createStack(credentials, artifactRes.Bucket, artifactRes.key);

    } catch (err) {
      if (err.message.includes('already exists')) {
        // TODO stack 已经 deploy 需走 updateFunction 逻辑
        return;
      }
    }

    const result = await this.monitorStackResult(credentials, stackData.stackId, stage, path);
    this.core.cli.log('Deploy over, test url:', result.api);
    // return res;
  }

  /**
   * Fetch credentials directly or using a profile from serverless yml configuration or from the
   * well known environment variables
   * @returns {{region: *}}
   */
  getCredentials() {
    if (this.cachedCredentials) {
      // We have already created the credentials object once, so return it.
      return this.cachedCredentials;
    }
    const result: any = {};
    const stageUpper = this.getStage() ? this.getStage().toUpperCase() : null;

    // add specified credentials, overriding with more specific declarations
    try {
      impl.addProfileCredentials(result, 'default');
    } catch (err) {
      if (err.message !== 'Profile default does not exist') {
        throw err;
      }
    }
    // impl.addCredentials(result, this.serverless.service.provider.credentials); // config creds
    // if (this.serverless.service.provider.profile && !this.options['aws-profile']) {
    //   // config profile
    //   impl.addProfileCredentials(result, this.serverless.service.provider.profile);
    // }
    impl.addEnvironmentCredentials(result, 'AWS'); // creds for all stages
    impl.addEnvironmentProfile(result, 'AWS');
    impl.addEnvironmentCredentials(result, `AWS_${stageUpper}`); // stage specific creds
    impl.addEnvironmentProfile(result, `AWS_${stageUpper}`);
    if (this.options['aws-profile']) {
      impl.addProfileCredentials(result, this.options['aws-profile']); // CLI option profile
    }

    // const deploymentBucketObject = this.serverless.service.provider.deploymentBucketObject;
    // if (
    //   deploymentBucketObject &&
    //   deploymentBucketObject.serverSideEncryption &&
    //   deploymentBucketObject.serverSideEncryption === 'aws:kms'
    // ) {
    result.signatureVersion = 'v4';
    // }

    // Store the credentials to avoid creating them again (messes up MFA).
    this.cachedCredentials = result;
    return result;
  }

  getStage() {
    const defaultStage = 'dev';
    const stageSourceValue = this.getStageSourceValue();
    return stageSourceValue.value || defaultStage;
  }

  getStageSourceValue() {
    const values = this.getValues(this, [
      ['options', 'stage'],
      ['serverless', 'config', 'stage'],
      ['serverless', 'service', 'provider', 'stage'],
    ]);
    return this.firstValue(values);
  }

  getValues(source, paths) {
    return paths.map(path => ({
      path,
      value: _.get(source, path.join('.')),
    }));
  }
  firstValue(values) {
    return values.reduce((result, current) => {
      return result.value ? result : current;
    }, {});
  }

  getRegion() {
    const defaultRegion = 'us-east-1';
    const regionSourceValue = this.getRegionSourceValue();
    return regionSourceValue.value || defaultRegion;
  }

  getRegionSourceValue() {
    const values = this.getValues(this, [
      ['options', 'region'],
      ['serverless', 'config', 'region'],
      ['serverless', 'service', 'provider', 'region'],
    ]);
    return this.firstValue(values);
  }

  setGlobalDependencies(name: string, version?: string) {
    if (!this.core.service.globalDependencies) {
      this.core.service.globalDependencies = {};
    }
    this.core.service.globalDependencies[name] = version || '*';
  }
}

function sleep(sec: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, sec);
  });
}