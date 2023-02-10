# 自定义错误

在 Node.js 中，每个异常都是内置的 Error 类型的实例。

通过扩展标准 Error，Midway 提供了内置的错误类型，额外增加了一些属性。

```typescript
export class MidwayError extends Error {
	// ...
}
```

现阶段，所有 Midway 框架提供的错误，都是该错误类抛出的实例。

MidwayError 包括几个属性：

- name 错误的名字，比如 Error，TypeError 等，在自定义错误中，为自定义错误的类名
- message 错误的消息
- stack 错误的堆栈
- code 自定义错误码
- cause 错误的来源



我们可以通过简单的实例化并且抛出来使用，比如:

```typescript
import { MidwayError } from '@midwayjs/core';

// ...

async findAll() {
  throw new MidwayError('my custom error');
}
```

也可以在业务中自定义一些错误。

常见的，我们会把异常统一定义到 error 目录中。

```
➜  my_midway_app tree
.
├── src
│   └── error
│       ├── customA.error.ts
│       └── customB.error.ts
├── test
├── package.json
└── tsconfig.json
```

如果业务有一些复用的异常，比如固定的错误

```typescript
// src/error/custom.error.ts
import { MidwayError } from '@midwayjs/core';

export class CustomError extends MidwayError {
  constructor() {
    super('my custom error', 'CUSTOM_ERROR_CODE_10000');
  }
}
```

然后在业务中抛出使用。

```typescript
import { CustomError } from './error/custom.error';

// ...

async findAll() {
  throw new CustomError();
}

```

上面的 `CUSTOM_ERROR_CODE_10000` 为错误的错误码，一般我们会为不同的错误分配不同的错误码和错误消息，以方便排查问题。



## 自定义错误码

框架提供了一种通用的注册错误码的机制，错误码后期可以方便的排错，统计。

在业务的错误定义，以及组件错误定义的时候非常有用。

错误码一般是个枚举值，比如：

```typescript
const CustomErrorEnum = {
  UNKNOWN: 10000,
  COMMON: 10001,
  PARAM_TYPE: 10002,
  // ...
};
```

在编码中，我们会提供固定的错误码，并且希望在 SDK 或者组件中不冲突，这就需要框架来支持。

Midway 提供了 `registerErrorCode` 方法，用于向框架注册不重复的错误码，并且进行一定的格式化。

比如，在框架内部，我们有如下的定义：

```typescript
import { registerErrorCode } from '@midwayjs/core';

export const FrameworkErrorEnum = registerErrorCode('midway', {
  UNKNOWN: 10000,
  COMMON: 10001,
  PARAM_TYPE: 10002,
	// ...
} as const);
```

`registerErrorCode` 包含两个参数：

- 错误分组，比如上面的 `midway` ，就是框架内置错误组名，在一个应用中，这个组名不应该重复
- 错误枚举对象，以错误名为 key，错误码为 value



方法会返回一个错误枚举值，枚举值会以错误名作为 key，错误分组加错误码作为 value。

比如：

```typescript
FrameworkErrorEnum.UNKNOWN
// => output: MIDWAY_10000

FrameworkErrorEnum.COMMON
// => output: MIDWAY_10001
```

这样，当错误中出现 `MIDWAY_10000` 的错误码时，我们就知道是什么错误了，配合文档就可以沉淀所有的错误。

在错误定义时，直接使用这个错误码枚举即可。

```typescript
export class MidwayParameterError extends MidwayError {
  constructor(message?: string) {
    super(message ?? 'Parameter type not match', FrameworkErrorEnum.PARAM_TYPE);
  }
}

// user code
async findAll(data) {
  if (!data.user) {
    throw new MidwayParameterError();
  }
  // ...
}

// output
// 2022-01-02 14:02:29,124 ERROR 14259 MidwayParameterError: Parameter type not match
//  		at APIController.findAll (....
//      at /Users/harry/project/midway-v3/packages/core/src/common/webGenerator.ts:38:57
//      at processTicksAndRejections (node:internal/process/task_queues:96:5) {
// 		code: 'MIDWAY_10002',
//		cause: undefined,
//	}

```

