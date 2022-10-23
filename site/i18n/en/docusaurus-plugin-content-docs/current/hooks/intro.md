# Introduction

Midway Hooks is a functional full stack framework that supports four core features: "Zero" Api & Type Safety & Full Stack Kit & Powerful Backend.

## Feature introduction

### Zero APIs

The back-end interface functions developed in the Midway Hooks full-stack application can be directly imported and called, without the need for handwritten Ajax glue layers at the front and back ends. Here is a simple example:

Backend code:

```ts
import {
  APIs,
  Post,
} from '@midwayjs/hooks';

export default Api(
  Post(), // Http Path: /api/say,
  async (name: string) => {
    return `Hello ${name}!`;
  }
);
````

Front-end call:

```ts
import say from './api';

const response = await say('Midway');
console.log(response); // Hello Midway!
````

### Type Safety and Runtime Safety

Using the [Validate](./validate.md) validator provided by `@midwayjs/hooks`, you can achieve type-safe + runtime-safe links from front-end to back-end. Here is a simple example:

Backend code:

```ts
import {
  APIs,
  Post,
  Validate,
} from '@midwayjs/hooks';
import { z } from 'zod';

export default Api(
  Post('/hello'),
  Validate(z.string(), z.number()),
  async (name: string, age: number) => {
    return `Hello ${name}, you are ${age} years old.`;
  }
);
````

All-in-one call:

```ts
import hello from './api';

try {
  await hello(null, null);
} catch (error) {
  console.log(error.message); // 'name must be a string'
  console.log(error.status); // 422
}
````

throughout the process.

- Front-end: Based on type, statically verify input parameters and get type hints
- Backend: Verify the incoming parameters of the frontend
- Business logic such as database: use the correct data

In this way, we can achieve static type safety + runtime safety at low cost.

### Full stack kit

In Midway Hooks, we provide `@midwayjs/hooks-kit` to quickly develop full stack applications.

You can use `hooks dev` to start full-stack applications, `hooks build` to package full-stack applications, and on the server side, you can also use `hooks start` to start the application with one click.

Solve your worries when using full-stack applications.

### Powerful backend

Midway Hooks is developed based on Midway.

Midway is an 8-year-old Node.js framework with powerful back-end functions, including Cache / Redis / Mongodb / Task / Config and other commonly used components under the Web.

And all of this you can enjoy seamlessly when using Midway Hooks.

## create application

Midway Hooks currently provides the following templates:

- Full stack application
  - [react](https://github.com/midwayjs/hooks/blob/main/examples/react)
  - [vue](https://github.com/midwayjs/hooks/blob/main/examples/vue)
  - [prisma](https://github.com/midwayjs/hooks/blob/main/examples/prisma)
- API Server
  - [api](https://github.com/midwayjs/hooks/blob/main/examples/api)

The command to create an application based on the specification is as follows:

```bash
npx degit https://github.com/midwayjs/hooks/examples/<name>
````

The full stack application command to create a react template is as follows:

```bash
npx degit https://github.com/midwayjs/hooks/examples/react ./hooks-app
````

The application command to create an api template is as follows:

```bash
npx degit https://github.com/midwayjs/hooks/examples/api ./hooks-app
````

## Next step

- Learn how to develop interfaces and provide them for front-end calls: [Interface Development](./api.md)
- How to use and create reusable Hooks: [Hooks](./builtin-hooks.md)
- How to validate user parameters at runtime: [validate](./validate.md)