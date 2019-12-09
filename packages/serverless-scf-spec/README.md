# SFC spec generator

根据 scf spec 描述

地址：https://cloud.tencent.com/document/product/583/36198


## API

scf 发布支持多函数，所以直接将 spec 转换为固定的 template.yml，示例见 `/resource` 目录。

**generateFunctionsSpecFile**

根据传入的标准 spec 文件，生成 scf 类型的 spec 文件。

```ts
import { generateFunctionsSpecFile } from '@ali/scf-spec-generator';
import * as path from 'path';

generateFunctionsSpecFile(path.join(__dirname, './fixtures/serverless.yml'));
```

**generateFunctionsSpec**

根据传入的标准 spec 文件，生成 scf 类型的 spec JSON。

```ts
import { generateFunctionsSpec } from '@ali/scf-spec-generator';
import * as path from 'path';

const result = generateFunctionsSpec(path.join(__dirname, './fixtures/fun.yml'));
console.log(result);  // scf spec 的 json
```
