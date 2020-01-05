# serverless invoke

本模块用于在本地执行函数、本地debug调试函数

## Usage
```
import { invoke } from '@midwayjs/serverless-invoke';

(async () => {
    const result = await invoke({
        functionName: string        // 函数名，如 index
        data?: any[]                // 函数入参，需要传入数组
        functionDir?: string        // 函数(serverless.yml)所在目录，默认为 process.env.PWD
        debug?: string              // debug端口号，不指定则不开启debug单步调试功能
        trigger?: string            // 函数触发器，默认会从函数的serverless.yml配置中events数组中选择第一个，例如 http
    });
})();
```
