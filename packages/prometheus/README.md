### 自定义方法

定义 Histogram 方法：
```
@Configuration({
  imports: [
    koa,
    validate,
    prometheus,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {
    const result = await this.app.getApplicationContext().getAsync(DataService);
    // 此处定义了一个名字叫 test_histogram 的 Histogram
    result.define('test_histogram', 'Histogram', {
      help: '132',
      name: 'test_histogram',
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
    });
  }
}
```

为了测试这个Histogram，我们在一个接口里面：
```
import { Inject, Controller, Get, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { DataService } from '@midwayjs/prometheus';
import { UserService } from '../service/user.service';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  dataService: DataService;

  @Get('/get_user')
  async getUser(@Query('uid') uid) {
    this.dataService.observe('test_histogram', [], 100); //此处我们observe了这个histogram
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }
}
```

然后访问这个接口，然后我们查看我们 /metrics 的接口返回:
```
# HELP test_histogram 132
# TYPE test_histogram histogram
test_histogram_bucket{le="5",APP_NAME="default"} 0
test_histogram_bucket{le="10",APP_NAME="default"} 0
test_histogram_bucket{le="25",APP_NAME="default"} 0
test_histogram_bucket{le="50",APP_NAME="default"} 0
test_histogram_bucket{le="100",APP_NAME="default"} 1
test_histogram_bucket{le="250",APP_NAME="default"} 1
test_histogram_bucket{le="500",APP_NAME="default"} 1
test_histogram_bucket{le="1000",APP_NAME="default"} 1
test_histogram_bucket{le="2500",APP_NAME="default"} 1
test_histogram_bucket{le="5000",APP_NAME="default"} 1
test_histogram_bucket{le="10000",APP_NAME="default"} 1
test_histogram_bucket{le="+Inf",APP_NAME="default"} 1
test_histogram_sum{APP_NAME="default"} 100
test_histogram_count{APP_NAME="default"} 1
```

至此，已经我们想要的自定义 Histogram 了。