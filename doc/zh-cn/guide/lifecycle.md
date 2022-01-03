# 生命周期

在通常情况下，我们希望在应用启动的时候做一些初始化、或者其他一些预处理的事情，比如创建数据库连接、预生成一些配置，而不是在请求响应时去处理。


## 扩展生命周期


Midway 的生命周期是通过 `src/configuration.ts` 文件，实现 ILifeCycle 接口，就可以在容器 ready 的时候处理这类需求。


:::info
注意，这里的 ready 指的是依赖注入容器 ready，并不是应用 ready，所以你可以对应用做任意扩展，比如添加中间件，连接数据库等等。
:::


接口定义如下。


```typescript
interface ILifeCycle {
  /**
   * 在应用 ready 的时候执行
   * @param container IoC 容器
   * @param app 应用 app
   */
  onReady(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;
  
  /**
  * 在应用配置加载后执行
  */
  onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;
  /**
   * 在应用停止的时候执行
   * @param container IoC 容器
   * @param app 应用 app
   */
  onStop?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;
}
```


举个例子。


我们需要在初始化时提前连接一个数据库，由于在类中，所以也可以通过 `@Inject`  装饰器注入 db 这样一个数据库的连接工具类，这个实例包含 connect 和 close 两个函数：


```typescript
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';

@Configuration()
export class ContainerConfiguration implements ILifeCycle {
  @Inject()
  db: any;

  async onReady(container: IMidwayContainer): Promise<void> {
    // 建立数据库连接
    await this.db.connect();
  }
  
  async onStop(): Promise<void> {
	// 关闭数据库连接
    await this.db.close();
  }
}
```


这样，我们就能够在应用启动时建立数据库连接，而不是在请求响应时再去创建。同时，在应用停止时，也可以优雅的关闭数据库连接。


除此之外，通过这个方式，可以对默认注入的对象做扩充。


```typescript
import * as sequelize from 'sequelize';

@Configuration()
export class ContainerConfiguration implements ILifeCycle {

  async onReady(container: IMidwayContainer): Promise<void> {
    // 三方包对象
    container.registerObject('sequelize', sequelize);
  }
  
}
```


在其他的类中可以直接注入使用。


```typescript
export class IndexHandler {

	@Inject()
  sequelize;
  
  async handler() {
  	console.log(this.sequelize);
  }
}
```

