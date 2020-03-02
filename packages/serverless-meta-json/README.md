# serverless-meta-json

用于生成函数元数据json，包含函数信息、网关信息等内容。

### Usage
```js
// 简单的使用方式
const { simpleGenerator } from '@midwayjs/serverless-meta-json';
const meta = await simpleGenerator(
  // 生成的函数压缩文件所在目录
  archivesPath: string,
  // 函数的yml描述文件数据
  ymlData: any,
  // 额外的数据，会直接添加到函数信息中
  extra?: any,
);
```

```js
// 普通的使用方式
const { generator } from '@midwayjs/serverless-meta-json';
const meta = await generator({
  // 函数的yml描述文件数据
  yamlData: any;
  // 额外的数据，会直接添加到函数信息中
  extra: any;
  // 函数压缩文件类型，默认为 zip                             
  archiveType?: string;
  // 函数压缩文件位置列表，如果传了此参数，那么 函数名 就会从地址中获取（其他情况从ymlData中的functions中获取）
  // 如 ['./test/funcA.zip' ]，那么函数名即为 funcA
  archivePaths?: string[];
  // 生成meta中的函数压缩文件名，默认为 `${funcName}.${archiveType}`
  generatorArchivePath?: (functionInfo: any) => string;
  // meta中的函数压缩文件所在目录地址，默认为 './'，结合上面生成的函数压缩文件名一起生成写入到meta中的 函数压缩文件位置
  archiveDirPath?: string;
});
```

### meta Demo 及 释义
```json
{
  "spec-version": "1.0.0",                // 版本
  "functions": [                          // 函数信息
    {
      "name": "a",                        // 函数名
      "archive": "./archives/a.zip",      // 生成的zip文件位置
      "handler": "a.handler",             // 函数handler
      "trigger": [                        // 函数触发器列表
        {
          "http": {                       // http触发器
            "path": "/api/a",
            "method": []
          }
        }
      ]
    },
    {
      "name": "b",
      "archive": "./archives/b.zip",
      "handler": "b.handler",
      "trigger": [
        {
          "http": {
            "path": "/api/b",
            "method": [
              "GET"
            ]
          }
        }
      ]
    }
  ],
  "gateway": {                                // 网关信息
    "kind": "simple-mapping",                 // 网关信息类型
    "paths": {                                // 网关路径列表
      "/api/a": {                             // 路径
        "ALL": {                              // 方法，ALL代表GET + POST
          "x-gateway-intergration": {
            "type": "function",               // 类型，函数
            "url": {                          // 对应的函数信息
              "group": "test",                // 函数组
              "name": "prefix-a",             // 函数名
              "version": "latest"             // 函数版本
            }
          }
        }
      },
      "/api/b": {
        "GET": {
          "x-gateway-intergration": {
            "type": "function",
            "url": {
              "group": "test",
              "name": "prefix-b",
              "version": "latest"
            }
          }
        }
      }
    },
    "x-gateway-domain": "meta-test.example.com" // 此应用绑定的域名信息
  }
}
```