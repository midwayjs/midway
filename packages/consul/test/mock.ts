import * as nock from 'nock';
import { agentService, checks, kvKey1, services } from './fixtures/mock.data';

/**
 * 自定义实现 mock consul 相关的 http API
 */
export function mockConsulAPI() {
  // 断开外部 http 地址访问
  nock.disableNetConnect();
  // 允许 app#superTest 的路由访问
  nock.enableNetConnect('127.0.0.1');

  const nockObj = nock('http://mock.consul.server:8500');

  // 注册服务
  nockObj.persist().put('/v1/agent/service/register').reply(200);

  // 反注册服务
  nockObj
    .persist()
    .persist()
    .put('/v1/agent/service/deregister/consul-demo%3A127.0.0.1%3A7001')
    .reply(200);

  // 查询服务
  nockObj
    .persist()
    .get('/v1/agent/services/consul-demo%3A127.0.0.1%3A7001')
    .reply(200, services);
  nockObj.persist().get('/v1/agent/services').reply(200, agentService);

  // 健康检查
  nockObj
    .persist()
    .get('/v1/health/checks/consul-demo%3A127.0.0.1%3A7001')
    .reply(200, checks);
  nockObj.persist().get('/v1/health/checks/noexists').reply(200, []);

  // kv设置
  nockObj.persist().put('/v1/kv/key1').reply(200);
  nockObj.persist().delete('/v1/kv/key1').reply(200);
  nockObj.persist().get('/v1/kv/key1').reply(200, [kvKey1]);
}
