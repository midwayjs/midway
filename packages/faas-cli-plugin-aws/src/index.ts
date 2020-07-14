import { readFileSync, createReadStream } from 'fs';
import { join, basename } from 'path';
import { S3, Lambda, CloudFormation } from 'aws-sdk';
import { render } from 'ejs';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { BasePlugin, ICoreInstance } from '@midwayjs/fcli-command-core';

import {
  addProfileCredentials,
  addEnvironmentProfile,
  addEnvironmentCredentials,
} from './profile';
import {
  S3UploadResult,
  LambdaFunctionOptions,
  StackEvents,
  StackResourcesDetail,
} from './interface';

// const fs = require('fs');
import { get } from 'lodash';

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

  async package() {
    this.core.cli.log('Start package');
    await this.core.invoke(['package'], true, {
      ...this.options,
      skipZip: false,
    });
  }

  async featchBucket(bucket: string): Promise<S3UploadResult> {
    this.core.cli.log('Check aws s3 bucket...');
    const s3 = new S3({ apiVersion: '2006-03-01' });
    try {
      return await new Promise((resolve, reject) => {
        s3.createBucket({ Bucket: bucket }, err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    } catch (err) {
      if (err.message.includes('connect ETIMEDOUT')) {
        this.core.cli.log(
          '  - cannot connect to aws network, please try again later.'
        );
      }
      this.core.cli.log('  -', err.message);
      process.exit(1);
    }
  }

  async uploadArtifact(bucket: string): Promise<S3UploadResult> {
    this.core.cli.log('Start upload artifact...');
    const uploadParams = { Bucket: bucket, Key: '', Body: null };
    // TODO fixed code.zip path
    const file = join(this.servicePath, 'code.zip');

    const fileStream = createReadStream(file);
    fileStream.on('error', err => {
      this.core.cli.log('  - File Error', err);
      process.exit(1);
    });
    // TODO loading bar by stream event
    uploadParams.Body = fileStream;

    // TODO use prefix by project-function
    uploadParams.Key = basename(file);

    const s3 = new S3({ apiVersion: '2006-03-01' });
    try {
      return await new Promise((resolve, reject) => {
        s3.upload(uploadParams, (err, data) => {
          if (err) {
            return reject(err);
          }
          if (data) {
            this.core.cli.log('  - artifact uploaded');
            return resolve(data);
          }
          resolve(null);
        });
      });
    } catch (err) {
      if (err.message.includes('connect ETIMEDOUT')) {
        this.core.cli.log(
          '  - cannot connect to aws network, please try again later.'
        );
      }
      this.core.cli.log('  - got error', err.message, 'please try again later');
      process.exit(1);
    }
  }

  async generateStackJson(
    name: string,
    handler = 'index.handler',
    path = '/hello',
    bucket: string,
    key: string
  ) {
    this.core.cli.log('  - generate stack template json');
    // TODO 支持多函数模板
    const tpl = readFileSync(
      join(__dirname, '../resource/aws-stack-http-template.ejs')
    ).toString();
    const params: { options: LambdaFunctionOptions } = {
      options: {
        name,
        handler,
        path,
        codeBucket: bucket,
        codeKey: key,
      },
    };
    return render(tpl, params);
  }

  async createStack(
    credentials,
    name: string,
    handler: string,
    bucket: S3UploadResult
  ): Promise<{ StackId: string }> {
    this.core.cli.log('Start stack create');

    // TODO support multi function;

    /**
     * this.core.service {
     *   service: { name: 'serverless-hello-world' },
     *   provider: { name: 'aws' },
     *   functions: { index: { handler: 'index.handler', events: [Array] } },
     *   package: { artifact: 'code.zip' }
     * }
     */
    const service = new CloudFormation(credentials);
    const TemplateBody = await this.generateStackJson(
      name,
      handler,
      '/hello',
      bucket.Bucket,
      bucket.Key
    );
    const params = {
      StackName: 'my-test-stack',
      OnFailure: 'DELETE',
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND'],
      Parameters: [],
      TemplateBody,
      // Tags: Object.keys(stackTags).map(key => ({ Key: key, Value: stackTags[key] })),
    };

    this.core.cli.log('  - creating stack request');
    return new Promise((resolve, reject) =>
      service.createStack(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data as any);
      })
    );
  }

  async updateStack(
    credentials,
    bucket: string,
    key: string,
    name: string
  ): Promise<{ StackId: string }> {
    this.core.cli.log('  - stack already exists, do stack update');
    // TODO support multi function;
    const names = Object.keys(this.core.service.functions);
    const handler = this.core.service.functions[names[0]].handler;
    const service = new CloudFormation(credentials);
    const TemplateBody = await this.generateStackJson(
      name,
      handler,
      '/hello',
      bucket,
      key
    );
    const params = {
      StackName: 'my-test-stack',
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND'],
      Parameters: [],
      TemplateBody,
    };
    this.core.cli.log('  - updating stack request');
    return new Promise((resolve, reject) =>
      service.updateStack(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data as any);
      })
    );
  }

  async monitorStackResult(
    credentials,
    stackId: string,
    stage = 'v1',
    path = '/hello'
  ) {
    this.core.cli.log('  - wait stack ready');
    const service = new CloudFormation(credentials);
    const params = {
      StackName: stackId,
    };

    process.stdout.write('    - checking');
    while (true) {
      const stackEvents: StackEvents = await new Promise((resolve, reject) =>
        service.describeStackEvents(params, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data as any);
        })
      );
      const events = stackEvents.StackEvents;
      const lastEvent = events[0];
      if (
        lastEvent &&
        lastEvent.ResourceType === 'AWS::CloudFormation::Stack' &&
        lastEvent.ResourceStatus === 'DELETE_COMPLETE'
      ) {
        return Promise.reject('stack deploy failed');
      }
      if (
        lastEvent &&
        lastEvent.ResourceType === 'AWS::CloudFormation::Stack' &&
        (lastEvent.ResourceStatus === 'CREATE_COMPLETE' ||
          lastEvent.ResourceStatus === 'UPDATE_COMPLETE')
      ) {
        break;
      }
      process.stdout.write('.');
      await sleep(1000);
    }
    this.core.cli.log('\n  - stack ready, check api url');

    const result: StackResourcesDetail = await new Promise((resolve, reject) =>
      service.describeStackResources(
        {
          StackName: stackId,
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data as any);
        }
      )
    );

    const { StackResources } = result;
    const data = StackResources.find(
      res => res.ResourceType === 'AWS::ApiGateway::RestApi'
    );

    // https://wsqd4ni6i5.execute-api.us-east-1.amazonaws.com/Prod/hello-curl
    const api = `https://${data.PhysicalResourceId}.execute-api.${credentials.region}.amazonaws.com/${stage}${path}`;
    return {
      api,
    };
  }

  async updateFunction(
    credentials,
    name: string,
    bucket: S3UploadResult
  ): Promise<any> {
    this.core.cli.log('  - upadte function');
    const service = new Lambda(credentials);
    // TODO check md5
    // const result = await new Promise<any>((resolve, reject) => {
    //   service.getFunction({ FunctionName: name },
    //     (err, data) => err ? reject(err) : resolve(data));
    // });

    // TODO support multi function;
    const params = {
      FunctionName: name,
      S3Bucket: bucket.Bucket,
      S3Key: bucket.Key,
    };
    /**
     * {
     *    FunctionName: 'serverless-hello-world-index',
     *    FunctionArn: 'arn:aws:lambda:us-east-1:752677612709:function:serverless-hello-world-index',
     *    Runtime: 'nodejs12.x',
     *    Role: 'arn:aws:iam::752677612709:role/service-role/hello-curl-role-5tk89mye',
     *    Handler: 'index.handler',
     *    CodeSize: 311,
     *    Description: '',
     *    Timeout: 3,
     *    MemorySize: 128,
     *    LastModified: '2020-07-12T18:10:09.191+0000',
     *    CodeSha256: 'pg5zZr5JSWbuN14CoyCzcz5tu0mZA7mxAoIgdC5+dL0=',
     *    Version: '$LATEST',
     *    KMSKeyArn: null,
     *    TracingConfig: { Mode: 'PassThrough' },
     *    MasterArn: null,
     *    RevisionId: '7d0b02dc-cde7-4680-9db1-95792282f96c',
     *    State: 'Active',
     *    StateReason: null,
     *    StateReasonCode: null,
     *    LastUpdateStatus: 'Successful',
     *    LastUpdateStatusReason: null,
     *    LastUpdateStatusReasonCode: null
     *  }
     */
    await new Promise((resolve, reject) =>
      service.updateFunctionCode(params, err => (err ? reject(err) : resolve()))
    );
    this.core.cli.log('  - upadte over');
  }

  async deploy() {
    const names = Object.keys(this.core.service.functions);
    const handler = this.core.service.functions[names[0]].handler;
    const name = `${this.core.service.service.name}-${names[0]}`;
    const stage = 'v1';
    const path = '/hello';

    await this.package();

    this.core.cli.log('Start deploy by aws-sdk');

    const bucket = `${this.core.service.service.name}-deploymentbucket`;
    await this.featchBucket(bucket);
    const artifactRes = await this.uploadArtifact(bucket);
    // console.log('artifactRes', artifactRes);

    // 配置 crendentials
    const credentials = this.getCredentials();
    credentials.region = this.getRegion();

    let stackData: { StackId: string } = null;
    try {
      stackData = await this.createStack(
        credentials,
        name,
        handler,
        artifactRes
      );
    } catch (err) {
      if (err.message.includes('already exists')) {
        await this.updateFunction(credentials, name, artifactRes);
        return;
      }
      throw err;
    }
    const result = await this.monitorStackResult(
      credentials,
      stackData.StackId,
      stage,
      path
    );
    this.core.cli.log('Deploy over, test url:', result.api);
  }

  /**
   * Fetch credentials directly or using a profile from serverless yml configuration or from the
   * well known environment variables
   * @returns {{region: *}}
   */
  getCredentials() {
    if (this.cachedCredentials) {
      return this.cachedCredentials;
    }
    const result: any = {};
    const stageUpper = this.getStage() || null;

    try {
      addProfileCredentials(result, 'default');
    } catch (err) {
      if (err.message !== 'Profile default does not exist') {
        throw err;
      }
    }

    // TODO check default cfg from f.yml

    addEnvironmentCredentials(result, 'AWS'); // creds for all stages
    addEnvironmentProfile(result, 'AWS');
    addEnvironmentCredentials(result, `AWS_${stageUpper}`); // stage specific creds
    addEnvironmentProfile(result, `AWS_${stageUpper}`);
    if (this.options['aws-profile']) {
      addProfileCredentials(result, this.options['aws-profile']); // CLI option profile
    }

    result.signatureVersion = 'v4';

    this.cachedCredentials = result;
    return result;
  }

  getStage() {
    const defaultStage = 'dev';
    const stageSourceValue = this.getStageSourceValue();
    return (stageSourceValue.value || defaultStage).toUpperCase();
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
      value: get(source, path.join('.')),
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
  return new Promise(resolve => {
    setTimeout(resolve, sec);
  });
}
