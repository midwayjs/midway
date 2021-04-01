import {Framework} from '@midwayjs/koa';
import * as nock from 'nock';
import {checks, services} from './fixtures/mock.data';

/**
 * 自定义实现 mock consul 相关的 http API
 */
export class ConsulKoaFramework extends Framework {
  async applicationInitialize(options) {
    await super.applicationInitialize(options);

    // 断开外部 http 地址访问
    nock.disableNetConnect();
    // 允许 app#superTest 的路由访问
    nock.enableNetConnect('127.0.0.1');

    this.mockConsulApi(this);
    this.mockConsulApi(this.app);
  }

  async beforeStop() {
    await super.beforeStop();
    nock.cleanAll();
  }

  mockConsulApi(object) {
    Object.defineProperty(object, 'nock', {
      configurable: true,
      enumerable: true,
      get: function () {
        return nock('http://mock.consul.server:8500');
      },
    });

    // 注册服务
    object['nock'].persist().put('/v1/agent/service/register').reply(200);

    // 反注册服务
    object['nock'].persist().put('/v1/agent/service/deregister/ali-demo:127.0.0.1:7001').reply(200);

    // 查询服务
    object['nock'].persist().get('/v1/catalog/service/ali-demo').reply(200, services);
    object['nock'].persist().get('/v1/catalog/service/noexists').reply(200, []);

    // 健康检查
    object['nock'].persist().get('/v1/health/checks/ali-demo').reply(200, checks);
    object['nock'].persist().get('/v1/health/checks/noexists').reply(200, []);
  }
}
