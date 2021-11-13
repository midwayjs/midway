import * as nock from 'nock';
import { checks, services } from './fixtures/mock.data';

/**
 * 自定义实现 mock consul 相关的 http API
 */
export function mockConsulAPI () {
  // 断开外部 http 地址访问
  nock.disableNetConnect();
  // 允许 app#superTest 的路由访问
  nock.enableNetConnect('127.0.0.1');

  const nockObj = nock('http://mock.consul.server:8500');

  // 注册服务
  nockObj.persist().put('/v1/agent/service/register').reply(200);

  // 反注册服务
  nockObj.persist().persist().put('/v1/agent/service/deregister/ali-demo%3A127.0.0.1%3A7001').reply(200);

  // 查询服务
  nockObj.persist().get('/v1/catalog/service/ali-demo').reply(200, services);
  nockObj.persist().get('/v1/catalog/service/noexists').reply(200, []);

  // 健康检查
  nockObj.persist().get('/v1/health/checks/ali-demo').reply(200, checks);
  nockObj.persist().get('/v1/health/checks/noexists').reply(200, []);
}
