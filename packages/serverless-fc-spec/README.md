# FC spec generator

根据 fc spec 描述

地址：https://github.com/aliyun/fun/blob/master/docs/specs/2018-04-03-zh-cn.md?file=2018-04-03-zh-cn.md


## API

fc 发布支持多函数，所以直接将 spec 转换为固定的 template.yml，示例见 `/resource` 目录。

**generateFunctionsSpecFile**

根据传入的标准 spec 文件，生成 fc 类型的 spec 文件。

```ts
import { generateFunctionsSpecFile } from '@ali/fc-spec-generator';
import * as path from 'path';

generateFunctionsSpecFile(path.join(__dirname, './fixtures/fun.yml'));
```

**generateFunctionsSpec**

根据传入的标准 spec 文件，生成 fc 类型的 spec JSON。

```ts
import { generateFunctionsSpec } from '@ali/fc-spec-generator';
import * as path from 'path';

const result = generateFunctionsSpec(path.join(__dirname, './fixtures/fun.yml'));
console.log(result);  // fc spec 的 json
```