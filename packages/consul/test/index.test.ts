import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import { IMidwayApplication, MidwayError } from '@midwayjs/core';
import { join } from 'path';
import * as nock from 'nock';
import { mockConsulAPI } from './mock';
import { ConsulService } from '../src';

describe('/test/consule.test.ts', () => {
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
  describe('test kv', () => {
    let app: IMidwayApplication;

    beforeAll(async () => {
      mockConsulAPI();
      app = await createApp(join(__dirname, 'fixtures', 'base-app'), {});
    });

    afterAll(async () => {
      await close(app);
      nock.cleanAll();
    });
    it('should set KV value', async () => {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      const result = await consulSrv.kvSet('key1', 'key1_value');
      expect(result).toBe(undefined);
    });
    it('should get KV value and values', async () => {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      const result = await consulSrv.kvGet('key1');
      expect(result[0].Value).toBe('key1_value');
      const resultValue = await consulSrv.kvGetValue('key1');
      expect(resultValue).toBe('key1_value');
      try {
        await consulSrv.kvGet('invalid key');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(MidwayError);
      }
      try {
        await consulSrv.kvGetValue('invalid key');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(MidwayError);
      }
    });
    it('should delete key', async () => {
      const consulSrv = await app
        .getApplicationContext()
        .getAsync(ConsulService);
      const pass = await consulSrv.kvDelete('key1');
      expect(pass).toBe(true);
      try {
        await consulSrv.kvDelete('invalid key');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(MidwayError);
      }
    });
  });
});
