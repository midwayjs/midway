import {close, createApp, createHttpRequest} from '@midwayjs/mock';
import {IMidwayApplication} from "@midwayjs/core";
import {IConsulBalancer} from "../src";
import {ConsulKoaFramework} from "./consul.framework";
import * as Consul from 'consul';

describe('/test/feature.test.ts', () => {

  describe('test new features', () => {

    let app: IMidwayApplication;

    beforeAll(async () => {
      // 如果使用真实的 server (consul agent --dev) 测试打开下面一行
      // 同时记得修改配置中的 consul.provide.host 参数
      // app = await createApp('base-app', {}, '@midwayjs/koa');
      app = await createApp('base-app', {}, ConsulKoaFramework);
    });

    afterAll(async () => {
      await close(app);
    });

    it('should provide health check route', async () => {
      const result = await createHttpRequest(app)
        .get('/consul/health/self/check');
      expect(result.status).toBe(200);
      expect(JSON.parse(result.text).status).toBe('success');
    });

    it('should get balancer from ioc container', async () => {
      const balancerService = await app.getApplicationContext().getAsync<IConsulBalancer>('consul:balancerService');
      const service = await balancerService.getBalancer().select(app.getProjectName());
      // const service = await balancerService.getBalancer().select(app.getProjectName(),false);
      expect(service['ServiceAddress']).toBe('127.0.0.1');
      expect(service['ServicePort']).toBe(7001);
    });

    it('should lookup consul service by balancer which injected', async () => {
      const result = await createHttpRequest(app)
        .get(`/test/balancer/lookup/${app.getProjectName()}`);
      expect(result.status).toBe(200);
      const service = JSON.parse(result.text);
      expect(service['ServiceAddress']).toBe('127.0.0.1');
      expect(service['ServicePort']).toBe(7001);
    });

    it('should get the origin consul object', async () => {
      try {
        const consul = await app.getApplicationContext().getAsync<Consul.Consul>('consul:consul');
        expect(consul).toBeDefined();
        expect(consul).toBeInstanceOf(Consul);
      } catch (e) {
        expect(e).not.toBeInstanceOf(Error);
      }
    });

  });

});
