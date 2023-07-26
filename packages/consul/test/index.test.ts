import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import { IMidwayApplication, MidwayError } from '@midwayjs/core';
import { join } from 'path';
import * as nock from 'nock';
import { mockConsulAPI } from './mock';
import { ConsulService, IService, MidwayConsulError } from '../src';

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
    it('should Select Service with datacenter', async function () {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      const result = await consulSrv.select(
        'consul-demo:127.0.0.1:7001',
        'dc1'
      );
      expect(result.Port).toBe(7001);
      expect(result.Address).toBe('127.0.0.1');
      try {
        const result = await consulSrv.select(
          'consul-demo:127.0.0.1:7001',
          'dc2'
        );
        expect(result.Port).toBe(7001);
        expect(result.Address).toBe('127.0.0.1');
      } catch (e) {
        expect(e).toBeInstanceOf(MidwayConsulError);
      }
    });
  });
});
describe('/test/consule.test.with.true.env', () => {
  describe('test service', () => {
    let app: IMidwayApplication;
    beforeAll(async () => {
      process.env.MIDWAY_SERVER_ENV = 'online';
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
    it('should Select Service with datacenter', async function () {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      const result: { pass: boolean; fail: boolean } = await new Promise(
        resolve => {
          setTimeout(async () => {
            let result = { pass: false, fail: false };
            try {
              const res = await consulSrv.select('consul-demo', 'dc1');
              result.pass =
                res.Port === 7001 && res.Address === '192.168.101.114';
            } catch (e) {
              result.pass = false;
            }
            try {
              await consulSrv.select('consul-demo', 'invalid');
              result.fail = false;
            } catch (e) {
              result.fail = true;
            }
            resolve(result);
          }, 4000);
        }
      );
      expect(result.pass).toBe(true);
      expect(result.fail).toBe(true);
    });
  });
});
