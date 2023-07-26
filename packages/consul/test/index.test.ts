import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import { IMidwayApplication, MidwayError } from '@midwayjs/core';
import { join } from 'path';
import * as nock from 'nock';
import { mockConsulAPI } from './mock';
import { ConsulService, IServiceNode, MidwayConsulError } from '../src';

const serviceName = 'consul-demo';

describe('/test/consule.test.with.mock', () => {
  describe('test service', () => {
    const host = '127.0.0.1';
    const port = 7001;
    const serviceId = `${serviceName}:${host}:${port}`;
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
      expect(result).toBe(serviceId);
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
      const result = await consulSrv.select(serviceName);
      expect(result.ServicePort).toBe(port);
      expect(result.ServiceAddress || result.Address).toBe(host);
    });
    it('should Select Service with datacenter', async function () {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      const result = await consulSrv.select(serviceName, {
        dc: 'dc1',
      });
      expect(result.ServicePort).toBe(port);
      expect(result.ServiceAddress || result.Address).toBe(host);
      try {
        await consulSrv.select(serviceName, {
          dc: 'dc2',
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(MidwayConsulError);
      }
    });
  });
});
describe('/test/consule.test.with.true.env', () => {
  const host = '192.168.101.114';
  const port = 7001;
  const serviceId = `${serviceName}:${host}:${port}`;
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
      expect(result).toBe(serviceId);
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

      const result: IServiceNode = await new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await consulSrv.select(serviceName);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        }, 5000);
      });
      expect(result.ServicePort).toBe(port);
      expect(result.ServiceAddress || result.Address).toBe(host);
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
              const res = await consulSrv.select(serviceName, {
                dc: 'dc1',
              });
              result.pass =
                res.ServicePort === port &&
                (res.ServiceAddress || res.Address) === host;
            } catch (e) {
              result.pass = false;
            }
            try {
              await consulSrv.select(serviceName, { dc: 'invalid' });
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
