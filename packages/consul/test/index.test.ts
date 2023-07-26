import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import { IMidwayApplication, MidwayError } from '@midwayjs/core';
import { join } from 'path';
import * as nock from 'nock';
import { mockConsulAPI } from './mock';
import { ConsulService, IService } from '../src';

describe('/test/consule.test.with.mock', () => {
  describe('test service', () => {
    let app: IMidwayApplication;

    beforeAll(async () => {
      mockConsulAPI();
      app = await createApp(join(__dirname, 'fixtures', 'base-app'), {});
    });

    afterAll(async () => {
      await close(app);
      nock.cleanAll();
    });

    it('should GET /health', async () => {
      const result = await createHttpRequest(app).get('/health');
      expect(result.status).toBe(200);
      expect(result.text).toBe('success');
    });
    it('should Register service', async function () {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      const result = consulSrv.serviceId;
      expect(result).toBe('consul-demo:127.0.0.1:7001');
    });
    it('should throw MidwayConsulError when service unavailable', async function () {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      try {
        await consulSrv.select('noexists');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(MidwayError);
      }
    });
    it('should Select Service', async function () {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      const result = await consulSrv.select('consul-demo:127.0.0.1:7001');
      expect(result.Port).toBe(7001);
      expect(result.Address).toBe('127.0.0.1');
    });
  });
});
describe('/test/consule.test.with.true.env', () => {
  describe('test service', () => {
    let app: IMidwayApplication;
    beforeAll(async () => {
      app = await createApp(join(__dirname, 'fixtures', 'base-app'), {});
    });

    afterAll(async () => {
      await close(app);
      nock.cleanAll();
    });

    it('should GET /health', async () => {
      const result = await createHttpRequest(app).get('/health');
      expect(result.status).toBe(200);
      expect(result.text).toBe('success');
    });
    it('should Register service', async function () {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      const result = consulSrv.serviceId;
      expect(result).toBe('consul-demo:192.168.101.114:7001');
    });
    it('should throw MidwayConsulError when service unavailable', async function () {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      try {
        await consulSrv.select('noexists');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(MidwayError);
      }
    });
    it('should Select Service', async function () {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);

      const result: IService = await new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await consulSrv.select('consul-demo');
            resolve(result);
          } catch (e) {
            reject(e);
          }
        }, 5000);
      });
      expect(result.Port).toBe(7001);
      expect(result.Address).toBe('192.168.101.114');
    });
  });
});
