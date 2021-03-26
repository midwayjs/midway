# midway consul

## How to use

```shell
npm i @midwayjs/consul -S
npm i @types/consul -D
```

## Support

- [x] register (optional)
- [x] deregister on the shutdown (optional)
- [x] service balancer (default random)
- [x] expose the origin consul object

## Usage age

### 1. import component firstly.

```
import * as consul from '@midwayjs/consul'

@Configuration({
  imports: [
    consul
  ],
  importConfigs: [join(__dirname, 'config')]
})
export class ContainerConfiguration {}
```

### 2. config consul server and service definition.

```
consul: {
  provider: {
    // 注册本服务
    register: true,
    // 应用正常下线反注册
    deregister: true,
    // consul server 主机
    host: '192.168.0.10',
    // consul server 端口
    port: 8500,
    // 调用服务的策略(默认选取 random 具有随机性)
    strategy: 'random',
  },
  service: {
    address: '127.0.0.1',
    port: 7001,
    tags: ['tag1', 'tag2'],
    // others consul service definition
  }
}
```

### 3. lookup the service instance to call.

```
// 1. 注入的方式
@Inject('consul:balancerService')
balancerService: IConsulBalancer;
// 2. 编码的方式
const balancerService = await app.getApplicationContext().getAsync<IConsulBalancer>('consul:balancerService');

// 查询的 service 数据是 consul 返回的原生数据，因为组件并不知道应用层使用了 consul 的哪些元数据信息
// 注意下 select 在没有服务实例时会抛出 Error

// 1. 查询通过健康检查的服务
const service = await balancerService.getBalancer().select('the-service-name');
// 2. 可能取到不健康的服务
const service = await balancerService.getBalancer().select('the-service-name', false);
```

### 4. inject the origin consul object.

```
import * as Consul from 'consul';

// 使用 consul 官方包装的 API 接口
@Inject('consul:consul')
consul: Consul.Consul;
```
