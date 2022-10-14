# Use components

Components are Midway's extension mechanism. We will develop reusable business code, or logical and abstract common capabilities into components, so that these codes can be reused in all Midway scenarios.



## Enable components

Components are generally multiplexed in the form of npm packets. Each component is a code package that can be `require` directly. null``

First, add dependencies to the application.

```json
// package.json
{
  "dependencies ": {
    "@midwayjs/validate": "^3.0.0"
  }
}
```

We need to enable this component in the code. Midway's component loading capability is designed in the `src/configuration.ts` file.

```typescript
// src/configuration.ts of application or function
import { Configuration } from '@midwayjs/decorator';
import * as validate from '@midwayjs/validate';

@Configuration ({
  imports: [validate]
})
export class ContainerLifeCycle {}
```



## Enable components for different environments

Sometimes, we need to use components in special environments, such as when developing locally.  `imports` attributes can be passed into an array of objects, and we can configure the environment enabled by the component in the object.

For example, the commonly used `info` component can be enabled only in the local environment for security purposes.

```typescript
// src/configuration.ts of application or function
import { Configuration } from '@midwayjs/decorator';
import * as info from '@midwayjs/info';

@Configuration ({
  imports: [
    {
      component: info
      enabledEnvironment: ['local']
    },
  ],
null
export class ContainerLifeCycle {}
```

- `component` is used to specify a component object, which must contain a `Configuration` exported attribute
- `enabledEnvironment` the array of environments enabled by the component



## Development component

For more information, see [Component development](component_development).
