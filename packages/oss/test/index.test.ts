import { join, basename } from 'path';
import { OSSService, OSSSTSService, OSSServiceFactory } from '../src';
import { createReadStream } from 'fs';
import { createSTSClient } from './sts_client';
import { createLightApp, close } from '@midwayjs/mock';

if (process.env.GITHUB_JOB && !process.env.ALI_SDK_OSS_ID) {
  // pr 环境
  describe('/test/index.test.ts', () => {
    it('should skip pr', function () {
      console.log('skip in pr');
    });
  });
  // @ts-ignore
  return;
}

async function retry(fn) {
  return await Promise.resolve(fn()).catch(fn()).catch(fn());
}

describe('/test/index.test.ts', () => {

  it('should throw error when missing endpoint or region', async () => {
    let app;
    try {
      app = await createLightApp(join(__dirname, './fixtures/base-app-missing-config'));
    } catch (err) {
      expect(err.message).toEqual('[@midwayjs/oss] Must set `accessKeyId` and `accessKeySecret` in oss\'s config');
    }
    await close(app);
  });

  describe('test oss', () => {
    let container;
    let lastUploadFileName;
    let ossService;
    beforeAll(async () => {
      const app = await createLightApp(join(__dirname, './fixtures/base-app'));
      container = app.getApplicationContext();

      const ossConfig = app.getConfig('oss').client;
      ossService = await container.getAsync(OSSService);
      const bucket = ossConfig.bucket;
      try {
        const bucket = ossConfig.bucket;
        const result = await ossService.putBucket(bucket, ossConfig.region);
        expect(result.bucket).toEqual(bucket);
        expect(result.res.status).toEqual(200);
      } catch (err) {
        // console.log('putBucket error: %s', err);
        if (err.name !== 'BucketAlreadyExistsError') {
          console.log('create bucket %s error: %s', bucket, err);
          console.log(err);
          console.log(err.stack);
          throw err;
        }
      }
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      if (lastUploadFileName) {
        await ossService.delete(lastUploadFileName);
      }
    });

    it('should app.oss put file ok', async () => {
      const result = await ossService.put(basename(__filename), __filename);
      expect(result.url).toBeDefined();
      expect(result.res.status).toEqual(200);
    });

    it('should test proxy method', function () {
      const proxyMethods = [
        'abortMultipartUpload',
        'append',
        'completeMultipartUpload',
        'copy',
        'createVod',
        'delete',
        'deleteBucket',
        'deleteBucketCORS',
        'deleteBucketLifecycle',
        'deleteBucketLogging',
        'deleteBucketReferer',
        'deleteBucketWebsite',
        'deleteChannel',
        'deleteMulti',
        'generateObjectUrl',
        'get',
        'getACL',
        'getBucketACL',
        'getBucketCORS',
        'getBucketInfo',
        'getBucketLifecycle',
        'getBucketLocation',
        'getBucketLogging',
        'getBucketReferer',
        'getBucketWebsite',
        'getChannel',
        'getChannelHistory',
        'getChannelStatus',
        'getObjectUrl',
        'getRtmpUrl',
        'getStream',
        'head',
        'initMultipartUpload',
        'list',
        'listBuckets',
        'listChannels',
        'listParts',
        'listUploads',
        'multipartUpload',
        'multipartUploadCopy',
        'put',
        'putACL',
        'putBucket',
        'putBucketACL',
        'putBucketCORS',
        'putBucketLifecycle',
        'putBucketLogging',
        'putBucketReferer',
        'putBucketWebsite',
        'putChannel',
        'putChannelStatus',
        'putMeta',
        'putStream',
        'restore',
        'signatureUrl',
        'uploadPart',
        'uploadPartCopy',
        'useBucket'
      ];

      for (const method of proxyMethods) {
        const fn = jest.spyOn(ossService['instance'], method).mockImplementation(() => {
          return 'hello world'
        });
        ossService[method].call(ossService);
        expect(fn).toHaveBeenCalled();
      }
    });
  });

  it('should upload file stream to cluster oss', async () => {
    let app = await createLightApp(join(__dirname, './fixtures/base-app-cluster'));
    const container = app.getApplicationContext();
    const ossService = await container.getAsync(OSSService);
    const name = 'oss-test-upload-' + process.version + '-' + Date.now();
    const body = await ossService.put(name, createReadStream(__filename));
    expect(body.url).toBeDefined();
    await ossService.delete(name);
    await close(app);
  });

  it.skip('should assumeRole with oss sts', async () => {
    let app = await createLightApp(join(__dirname, './fixtures/base-app-sts'));
    const container = app.getApplicationContext();
    const ossSTSService = await container.getAsync(OSSSTSService);

    const roleArn = require('./sts_config').roleArn;
    let result = await retry(async () => {
      return ossSTSService.assumeRole(roleArn);
    });
    expect(result.res.status).toEqual(200);

    const accessKeyId = result.credentials.AccessKeyId;
    const accessKeySecret = result.credentials.AccessKeySecret;
    const stsToken = result.credentials.SecurityToken;

    console.time('sts');
    const client = createSTSClient(accessKeyId, accessKeySecret, stsToken);
    console.timeEnd('sts');
    const list = await client.list();
    expect(list.objects).toBeDefined();

    await close(app);
  });

  it.skip('should assumeRole with oss sts clients', async () => {
    let app = await createLightApp(join(__dirname, './fixtures/base-app-sts-clients'));
    const container = app.getApplicationContext();
    const ossServiceFactory = await container.getAsync<OSSServiceFactory>(OSSServiceFactory);

    const roleArn = require('./sts_config').roleArn;
    const client1 = ossServiceFactory.get<OSSSTSService>('client1');
    const client2 = ossServiceFactory.get('client2');

    expect(client2.put).toBeDefined();

    let result = await retry(async () => {
      return client1.assumeRole(roleArn);
    });

    expect((result as any).res.status).toEqual(200);

    const accessKeyId = result.credentials.AccessKeyId;
    const accessKeySecret = result.credentials.AccessKeySecret;
    const stsToken = result.credentials.SecurityToken;

    console.time('sts');
    const client = createSTSClient(accessKeyId, accessKeySecret, stsToken);
    console.timeEnd('sts');

    const list = await client.list();
    expect(list.objects).toBeDefined();

    await close(app);
  });
});
