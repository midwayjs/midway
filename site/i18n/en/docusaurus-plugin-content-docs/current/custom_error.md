# Custom error

In Node.js, each exception is an instance of the built-in Error type.

By extending the standard Error,Midway provides built-in error types with additional attributes.

```typescript
export class MidwayError extends Error {
	// ...
}
```

At this stage, all errors provided by Midway framework are instances thrown by this error class.

MidwayError includes several properties:

- The name of the name error, such as Error,TypeError, etc., is the class name of the custom error in the custom error.
- message error message
- Stack error stack
- Code custom error code
- Cause the source of the error



We can use it by simply instantiating and throwing it out, such:

```typescript
import { MidwayError } from '@midwayjs/core';

// ...

async findAll() {
  throw new MidwayError('my custom error');
}
```

Some errors can also be customized in the business.

In common, we will uniformly define exceptions into the error directory.

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

If the business has some reuse exceptions, such as fixed errors

```typescript
// src/error/custom.error.ts
import { HttpStatus } from '@midwayjs/core';

export class CustomError extends MidwayError {
  constructor() {
    super('my custom error', 'CUSTOM_ERROR_CODE_10000');
  }
}
```

Then throw the use in the business.

```typescript
import { CustomError } from './error/custom.error';

// ...

async findAll() {
  throw new CustomError();
}

```

The above `CUSTOM_ ERROR_CODE_10000` is the wrong error code. Generally, we will assign different error codes and error messages to different errors to facilitate troubleshooting.



## Custom error code

The framework provides a universal mechanism for registering error codes. Error codes can be easily debuggered and counted later.

It is very useful when business errors are defined and component errors are defined.

The error code is generally an enumeration value, such:

```typescript
const CustomErrorEnum = {
  UNKNOWN: 10000
  COMMON: 10001
  PARAM_TYPE: 10002,
  // ...
};
```

In encoding, we will provide a fixed error code and hope that there will be no conflicts in the SDK or components, which requires framework support.

Midway provides `registerErrorCode` method for registering non-duplicate error codes with the framework and for certain formatting.

For example, within the framework, we have the following definition:

```typescript
import { registerErrorCode } from '@midwayjs/core';

export const FrameworkErrorEnum = registerErrorCode('midway', {
  UNKNOWN: 10000
  COMMON: 10001
  PARAM_TYPE: 10002,
	// ...
} as const);
```

The `registerErrorCode` contains two parameters:

- Error grouping, such as `midway`, is the name of the built-in error group in the framework. In an application, this group name should not be repeated.
- The error enumeration object is named key and the error code is value.



The method returns an error enumeration value with the error name as the key and the error group plus the error code as the value.

For example:

```typescript
FrameworkErrorEnum.UNKNOWN
// => output: MIDWAY_10000

FrameworkErrorEnum.COMMON
// => output: MIDWAY_10001
```

In this way, when the `MIDWAY_10000` error code appears in the error, we will know what the error is, and all the errors can be precipitated by cooperating with the document.

When defining errors, use this error code enumeration directly.

```typescript
export class MidwayParameterError extends MidwayError {
  constructor(message?: string) {
    super(message ?? 'Parameter type not match', FrameworkErrorEnum.PARAM_TYPE);
  }
}

// user code
async findAll(data) {
  if (! data.user) {
    throw new MidwayParameterError();
  }
  // ...
}

// output
// 2022-01-02 14:02:29,124 ERROR 14259 MidwayParameterError: Parameter type not match
// at APIController.findAll (....
// at /Users/harry/project/midway-v3/packages/core/src/common/webGenerator.ts:38:57
// at processTicksAndRejections (node:internal/process/task_queues:96:5) {
// code: 'MIDWAY_10002',
// cause: undefined
//}

```

