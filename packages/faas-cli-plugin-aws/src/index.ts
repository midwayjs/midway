import { homedir } from 'os';
import { join, basename } from 'path';
import {
  readFileSync,
  createReadStream,
  writeFileSync,
  mkdirSync,
  existsSync,
} from 'fs';
import { S3, Lambda, CloudFormation } from 'aws-sdk';
import { render } from 'ejs';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { BasePlugin, ICoreInstance } from '@midwayjs/fcli-command-core';

const { Input } = require('enquirer');

import {
  addProfileCredentials,
  addEnvironmentProfile,
  addEnvironmentCredentials,
} from './profile';
import {
  S3UploadResult,
  // LambdaFunctionOptions,
  StackEvents,
  StackResourcesDetail,
  MFunctions,
} from './interface';

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
      } else if (err.message.includes('Access Denied')) {
        this.core.cli.log('  - credential has not S3FullAccess permission.');
      } else {
        this.core.cli.log('  -', err.message);
      }
      this.core.cli.log('  - please check your ~/.aws/credentials');
      this.core.cli.log('Deploy failed.');
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
    fns: MFunctions[],
    stage: string,
    bucket: string,
    key: string
  ) {
    this.core.cli.log('  - generate stack template json');
    // TODO 支持多函数模板
    const tpl = readFileSync(
      join(__dirname, '../resource/aws-stack-http-template.ejs')
    ).toString();
    const params: {
      functions: Array<{
        name: string;
        handler: string;
        runtime?: string;
        description?: string;
        memorySize?: number;
        timeout?: number;
        codeBucket: string;
        codeKey: string;
        events: { path: string; method: string }[];
      }>;
      options?: { stage: string };
    } = {
      functions: fns.map(item =>
        Object.assign(
          {},
          {
            name: item.name,
            handler: item.handler,
            events: item.events,
            codeBucket: bucket,
            codeKey: key,
          }
        )
      ),
      options: {
        stage,
      },
    };
    return render(tpl, params);
  }

  async createStack(
    credentials,
    fns: MFunctions[],
    stage: string,
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
      fns,
      stage,
      bucket.Bucket,
      bucket.Key
    );
    const params = {
      StackName: 'ms-stack-' + this.core.service.service.name,
      OnFailure: 'DELETE',
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND'],
      Parameters: [],
      TemplateBody,
      // Tags: Object.keys(stackTags).map(key => ({ Key: key, Value: stackTags[key] })),
    };

    this.core.cli.log('  - creating stack request');
    try {
      return await new Promise((resolve, reject) =>
        service.createStack(params, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data as any);
        })
      );
    } catch (err) {
      if (err.message.includes('is not authorized to perform')) {
        this.core.cli.log(
          '  - credentials has not AWSCloudFormationFullAccess permission'
        );
        this.core.cli.log('  - please check your ~/.aws/credentials');
        this.core.cli.log('Deploy failed.');
        process.exit(1);
      } else {
        this.core.cli.log('  -', err.message);
      }
      throw err;
    }
  }

  async updateStack(
    credentials,
    bucket: string,
    key: string,
    fns: MFunctions[],
    stage
  ): Promise<{ StackId: string }> {
    this.core.cli.log('  - stack already exists, do stack update');
    // TODO support multi function;
    const service = new CloudFormation(credentials);
    const TemplateBody = await this.generateStackJson(fns, stage, bucket, key);
    const params = {
      StackName: 'ms-stack-' + this.core.service.service.name,
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
    fns: MFunctions[]
  ) {
    this.core.cli.log('  - wait stack ready', stackId);
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
        process.stdout.write('\n');
        return Promise.reject('Stack deploy failed');
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
    const datas = StackResources.filter(
      res => res.ResourceType === 'AWS::ApiGateway::RestApi'
    );

    // https://wsqd4ni6i5.execute-api.us-east-1.amazonaws.com/Prod/hello-curl
    fns.map(fn => {
      const api = `https://${datas[0].PhysicalResourceId}.execute-api.${credentials.region}.amazonaws.com/${stage}${fn.events[0].path}`;
      console.log(fn.name, 'test url', api);
    });
  }

  async updateFunction(
    credentials,
    fns: MFunctions[],
    bucket: S3UploadResult
  ): Promise<any> {
    this.core.cli.log('  - upadte function');
    const service = new Lambda(credentials);
    // TODO check md5
    // const result = await new Promise<any>((resolve, reject) => {
    //   service.getFunction({ FunctionName: name },
    //     (err, data) => err ? reject(err) : resolve(data));
    // });

    const tasks = fns.map(fn => {
      const params = {
        FunctionName: fn.name,
        S3Bucket: bucket.Bucket,
        S3Key: bucket.Key,
      };
      return new Promise((resolve, reject) =>
        service.updateFunctionCode(params, err =>
          err ? reject(err) : resolve()
        )
      );
    });
    tasks.push();
    await Promise.all(tasks);
    this.core.cli.log('  - upadte over');
  }

  async saveCredentials(accessKeyId: string, accessKeySecret: string) {
    if (!accessKeyId || !accessKeySecret) {
      throw new Error('please provide credentials');
    }
    const homeAwsDir = join(homedir(), '.aws');
    const awsCredentialsPath = join(homeAwsDir, 'credentials');
    if (!existsSync(homeAwsDir)) {
      mkdirSync(homeAwsDir);
    }
    const text =
      '[default]\n' +
      'aws_access_key_id = ' +
      accessKeyId +
      '\n' +
      'aws_secret_access_key = ' +
      accessKeySecret +
      '\n';
    writeFileSync(awsCredentialsPath, text);
  }

  getFunctions(): MFunctions[] {
    const obj: {
      [key: string]: {
        handler: string;
        events: Array<{
          [key: string]: {
            method: string;
            path: string;
          };
        }>;
      };
    } = this.core.service.functions as any;
    return Object.keys(obj).map(name => ({
      name,
      handler: obj[name].handler || 'index.handler',
      events: obj[name].events.reduce((arr, item) => {
        arr.push(
          ...Object.keys(item).map(type => ({
            type,
            ...item[type],
          }))
        );
        return arr;
      }, [] as { type: string; method: string; path: string }[]),
    }));
  }

  async deploy() {
    const stage = 'v1';
    const fns = this.getFunctions();

    await this.package();

    this.core.cli.log('Start deploy by aws-sdk');
    // 配置 crendentials
    let credentials = this.getCredentials();
    if (!credentials.credentials) {
      this.core.cli.log(
        'There is no credentials available, please ensure you have the permissions below:'
      );
      this.core.cli.log('  - AmazonS3FullAccess');
      this.core.cli.log('  - AWSCloudFormationFullAccess');
      this.core.cli.log('  - AWSLambdaFullAccess');
      this.core.cli.log('  - AmazonAPIGatewayAdministrator');
      this.core.cli.log(
        'There is no credentials available, please input aws credentials: (you can get credentials from https://console.aws.amazon.com/iam/home?region=us-east-1#/users)'
      );
      const accessKeyId = await new Input({
        message: 'aws_access_key_id =',
        show: true,
      }).run();
      const accessKeySecret = await new Input({
        message: 'aws_secret_access_key =',
        show: true,
      }).run();
      await this.saveCredentials(accessKeyId, accessKeySecret);
      credentials = this.getCredentials(true);
    }
    credentials.region = this.getRegion();

    const bucket = `${this.core.service.service.name}-deploymentbucket`;
    await this.featchBucket(bucket);
    const artifactRes = await this.uploadArtifact(bucket);
    // console.log('artifactRes', artifactRes);

    let stackData: { StackId: string } = null;
    try {
      stackData = await this.createStack(credentials, fns, stage, artifactRes);
    } catch (err) {
      if (err.message.includes('already exists')) {
        await this.updateFunction(credentials, fns, artifactRes);
        return;
      }
      throw err;
    }
    await this.monitorStackResult(credentials, stackData.StackId, stage, fns);
    this.core.cli.log('Deploy over');
  }

  /**
   * Fetch credentials directly or using a profile from serverless yml configuration or from the
   * well known environment variables
   * @returns {{region: *}}
   */
  getCredentials(force = false) {
    if (!force && this.cachedCredentials) {
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
