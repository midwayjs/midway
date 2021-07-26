import { Config, Init, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import * as OSS from 'ali-oss';
import * as assert from 'assert';
import { ServiceFactory } from '@midwayjs/core';

function checkBucketConfig(config) {
  assert(config.endpoint || config.region,
    '[@midwayjs/oss] Must set `endpoint` or `region` in oss\'s config');
  assert(config.accessKeySecret && config.accessKeyId,
    '[@midwayjs/oss] Must set `accessKeyId` and `accessKeySecret` in oss\'s config');
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class OSSServiceFactory<T = (OSS | OSS.STS)> extends ServiceFactory<T> {

  @Config('oss')
  ossConfig;

  @Init()
  async init() {
   await this.initClients(this.ossConfig);
  }

  async createClient(config): Promise<T> {
    if (config.cluster) {
      config.cluster.forEach(checkBucketConfig);
      return new (OSS as any).ClusterClient(config);
    }

    if (config.sts === true) {
      return new OSS.STS(config) as any;
    }

    checkBucketConfig(config);
    return new OSS(config) as any;
  }

  getName() {
    return 'oss';
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class OSSService implements OSS {
  @Inject()
  private serviceFactory: OSSServiceFactory<OSS>;

  private instance: OSS;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
  }

  abortMultipartUpload(name: string, uploadId: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.abortMultipartUpload(name, uploadId, options);
  }

  append(name: string, file: any, options?: OSS.AppendObjectOptions): Promise<OSS.AppendObjectResult> {
    return this.instance.append(name, file, options);
  }

  completeMultipartUpload(name: string, uploadId: string, parts: Array<{ number: number; etag: string }>, options?: OSS.CompleteMultipartUploadOptions): Promise<OSS.CompleteMultipartUploadResult> {
    return this.instance.completeMultipartUpload(name, uploadId, parts);
  }

  copy(name: string, sourceName: string, options?: OSS.CopyObjectOptions): Promise<OSS.CopyAndPutMetaResult> {
    return this.instance.copy(name, sourceName, options);
  }

  createVod(id: string, name: string, time: { startTime: number; endTime: number }, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.createVod(id, name, time, options);
  }

  delete(name: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.delete(name, options);
  }

  deleteBucket(name: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.deleteBucket(name, options);
  }

  deleteBucketCORS(name: string): Promise<OSS.NormalSuccessResponse> {
    return this.instance.deleteBucketCORS(name);
  }

  deleteBucketLifecycle(name: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.deleteBucketLifecycle(name, options);
  }

  deleteBucketLogging(name: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.deleteBucketLogging(name, options);
  }

  deleteBucketReferer(name: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.deleteBucketReferer(name, options);
  }

  deleteBucketWebsite(name: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.deleteBucketWebsite(name, options);
  }

  deleteChannel(id: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.deleteChannel(id, options);
  }

  deleteMulti(names: string[], options?: OSS.DeleteMultiOptions): Promise<OSS.DeleteMultiResult> {
    return this.instance.deleteMulti(names, options);
  }

  generateObjectUrl(name: string, baseUrl?: string): string {
    return this.instance.generateObjectUrl(name, baseUrl);
  }

  get(name: string, file?: any, options?: OSS.GetObjectOptions): Promise<OSS.GetObjectResult> {
    return this.instance.get(name, file, options);
  }

  getACL(name: string, options?: OSS.RequestOptions): Promise<OSS.GetACLResult> {
    return this.instance.getACL(name, options);
  }

  getBucketACL(name: string, options?: OSS.RequestOptions): Promise<{ acl: string; res: OSS.NormalSuccessResponse }> {
    return this.instance.getBucketACL(name, options);
  }

  getBucketCORS(name: string): Promise<{ rules: OSS.CORSRule[]; res: OSS.NormalSuccessResponse }> {
    return this.instance.getBucketCORS(name);
  }

  getBucketInfo(name: string): Promise<any> {
    return this.instance.getBucketInfo(name);
  }

  getBucketLifecycle(name: string, options?: OSS.RequestOptions): Promise<{ rules: OSS.LifecycleRule[]; res: OSS.NormalSuccessResponse }> {
    return this.instance.getBucketLifecycle(name, options);
  }

  getBucketLocation(name: string): Promise<any> {
    return this.instance.getBucketLocation(name);
  }

  getBucketLogging(name: string, options?: OSS.RequestOptions): Promise<{ enable: boolean; prefix: string | null; res: OSS.NormalSuccessResponse }> {
    return this.instance.getBucketLogging(name, options);
  }

  getBucketReferer(name: string, options?: OSS.RequestOptions): Promise<{ allowEmpty: boolean; referers: string[]; res: OSS.NormalSuccessResponse }> {
    return this.instance.getBucketReferer(name, options);
  }

  getBucketWebsite(name: string, options?: OSS.RequestOptions): Promise<{ index: string; error: string; res: OSS.NormalSuccessResponse }> {
    return this.instance.getBucketWebsite(name, options);
  }

  getChannel(id: string, options?: OSS.RequestOptions): Promise<{ data: OSS.PutChannelConf; res: OSS.NormalSuccessResponse }> {
    return this.instance.getChannel(id, options);
  }

  getChannelHistory(id: string, options?: OSS.RequestOptions): Promise<OSS.ChannelHistoryResult> {
    return this.instance.getChannelHistory(id, options);
  }

  getChannelStatus(id: string, options?: OSS.RequestOptions): Promise<OSS.GetChannelResult> {
    return this.instance.getChannelStatus(id, options);
  }

  getObjectUrl(name: string, baseUrl?: string): string {
    return this.instance.getObjectUrl(name, baseUrl);
  }

  getRtmpUrl(channelId?: string, options?: OSS.GetRtmpUrlOptions): string {
    return this.instance.getRtmpUrl(channelId, options);
  }

  getStream(name?: string, options?: OSS.GetStreamOptions): Promise<OSS.GetStreamResult> {
    return this.instance.getStream(name, options);
  }

  head(name: string, options?: OSS.HeadObjectOptions): Promise<OSS.HeadObjectResult> {
    return this.instance.head(name, options);
  }

  initMultipartUpload(name: string, options?: OSS.InitMultipartUploadOptions): Promise<OSS.InitMultipartUploadResult> {
    return this.instance.initMultipartUpload(name, options);
  }

  list(query: OSS.ListObjectsQuery | null, options: OSS.RequestOptions): Promise<OSS.ListObjectResult> {
    return this.instance.list(query, options);
  }

  listBuckets(query: OSS.ListBucketsQueryType | null, options?: OSS.RequestOptions): Promise<OSS.Bucket[]> {
    return this.instance.listBuckets(query, options);
  }

  listChannels(query: OSS.ListChannelsQuery, options?: OSS.RequestOptions): Promise<OSS.ListChannelsResult> {
    return this.instance.listChannels(query, options);
  }

  listParts(name: string, uploadId: string, query?: OSS.ListPartsQuery, options?: OSS.RequestOptions): Promise<OSS.ListPartsResult> {
    return this.instance.listParts(name, uploadId, query, options);
  }

  listUploads(query: OSS.ListUploadsQuery, options?: OSS.RequestOptions): Promise<OSS.ListUploadsResult> {
    return this.instance.listUploads(query, options);
  }

  multipartUpload(name: string, file: any, options: OSS.MultipartUploadOptions): Promise<OSS.MultipartUploadResult> {
    return this.instance.multipartUpload(name, file, options);
  }

  multipartUploadCopy(name: string, sourceData: OSS.MultipartUploadCopySourceData, options?: OSS.MultipartUploadOptions): Promise<OSS.MultipartUploadCopyResult> {
    return this.instance.multipartUploadCopy(name, sourceData, options);
  }

  put(name: string, file: any, options?: OSS.PutObjectOptions): Promise<OSS.PutObjectResult> {
    return this.instance.put(name, file, options);
  }

  putACL(name: string, acl: OSS.ACLType, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.putACL(name, acl, options);
  }

  putBucket(name: string, options?: OSS.PutBucketOptions): Promise<{ bucket: string; res: OSS.NormalSuccessResponse }> {
    return this.instance.putBucket(name, options);
  }

  putBucketACL(name: string, acl: OSS.ACLType, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.putBucketACL(name, acl, options);
  }

  putBucketCORS(name: string, rules: OSS.CORSRule[], options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.putBucketCORS(name, rules, options);
  }

  putBucketLifecycle(name: string, rules: OSS.LifecycleRule[], options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.putBucketLifecycle(name, rules, options);
  }

  putBucketLogging(name: string, prefix?: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.putBucketLogging(name, prefix, options);
  }

  putBucketReferer(name: string, allowEmpty: boolean, referers: string[], options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.putBucketReferer(name, allowEmpty, referers);
  }

  putBucketWebsite(name: string, config: OSS.PutBucketWebsiteConfig): Promise<OSS.NormalSuccessResponse> {
    return this.instance.putBucketWebsite(name, config);
  }

  putChannel(id: string, conf: OSS.PutChannelConf, options?: OSS.RequestOptions): Promise<OSS.PutChannelResult> {
    return this.instance.putChannel(id, conf, options);
  }

  putChannelStatus(id: string, status?: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.putChannelStatus(id, status, options);
  }

  putMeta(name: string, meta: OSS.UserMeta, options: OSS.RequestOptions): Promise<OSS.CopyAndPutMetaResult> {
    return this.instance.putMeta(name, meta, options);
  }

  putStream(name: string, stream: any, options?: OSS.PutStreamOptions): Promise<{ name: string; res: OSS.NormalSuccessResponse }> {
    return this.instance.putStream(name, stream, options);
  }

  restore(name: string, options?: OSS.RequestOptions): Promise<OSS.NormalSuccessResponse> {
    return this.instance.restore(name, options);
  }

  signatureUrl(name: string, options?: OSS.SignatureUrlOptions): string {
    return this.instance.signatureUrl(name, options);
  }

  uploadPart(name: string, uploadId: string, partNo: number, file: any, start: number, end: number, options?: OSS.RequestOptions): Promise<OSS.UploadPartResult> {
    return this.instance.uploadPart(name, uploadId, partNo, file, start, end, options);
  }

  uploadPartCopy(name: string, uploadId: string, partNo: number, range: string, sourceData: { sourceKey: string; sourceBucketName: string }, options: { timeout?: number | undefined; headers?: object | undefined }): Promise<OSS.UploadPartResult> {
    return this.instance.uploadPartCopy(name, uploadId, partNo, range, sourceData, options);
  }

  useBucket(name: string): void {
    return this.instance.useBucket(name);
  }
}
