# Operating environment

Node.js applications generally obtain environment variables through `NODE_ENV` to meet different needs in different environments. For example, in `production` environment, cache is turned on to optimize performance, while in `development` environment, all log switches are turned on to output detailed error messages, etc.



## Specify the operating environment


Since `NODE_ENV` will be intercepted and injected by some toolkits in some cases, under Midway system, we will acquire the environment first according to the `MIDWAY_SERVER_ENV`, while `NODE_ENV` will acquire as the second priority.


We can specify it by adding environment variables at startup.

```bash
MIDWAY_SERVER_ENV=prod npm start // first priority
NODE_ENV=local npm start // second priority
```
In windows, you must use the [cross-env](null) module to achieve the same effect.
```bash
cross-env MIDWAY_SERVER_ENV=prod npm start // first priority
cross-env NODE_ENV=local npm start // second priority
```



## Get the environment in the code


Midway provides the `getEnv()` method to obtain the environment for app objects. Midway handles different upper-level frameworks to ensure that the `getEnv()` method is available in different scenarios. .


```typescript
import { Application } from '@midwayjs/koa';

// process.env.MIDWAY_SERVER_ENV=prod

@Provide()
export class UserService {

  @App()
  app: Application;

  async invoke() {
    console.log(this.app.getEnv()); // prod
  }
}
```


If neither the `NODE_ENV` nor the `MIDWAY_SERVER_ENV` is assigned, the return value of the method is `prod` by default.

:::info
Note that you cannot get the environment directly through `NODE_ENV` and `MIDWAY_SERVER_ENV`, both values may be empty, and Midway will not set it in reverse. To obtain the environment, please obtain the API method provided by other frameworks through app.getEnv().
:::



## Common environmental variable values

In general, each company has its own environmental variable values, and here are some common environmental variable values and their corresponding descriptions.

| Value | Description |
| --- | --- |
| local | Local development environment |
| dev/daily/development | Daily development environment |
| pre/prepub | Pre-production environment |
| prod/production | Production environment |
| test/unittest | Unit test environment |
| benchmark | Performance test environment |



## Dependent on the acquisition environment from the injection container


In the process of dependent injection container initialization, Midway initializes a `EnvironmentService` service to parse the environment by default and maintains the service object throughout the life cycle.

For more information, see [Environment Services](./built_in_service#midwayenvironmentservice).
