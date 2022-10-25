## # Parameter Validation

## check

Midway Hooks uses [zod@3](https://www.npmjs.com/package/zod) as a validator, and provides `Validate(...schemas: any[])` to validate user input parameters, ` ValidateHttp(options)` function to validate Http structure.

Please install [zod](https://www.npmjs.com/package/zod) before use.

````
npm install zod
````

##Validate

The order of schemas passed in `Validate` matches the order of user input parameters.

### Basic example

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
  console.log(
    JSON.parse(error.data.message)
  );
  console.log(error.status); // 422
}
````

Manual call:

```ts
fetcher
  .post('/hello', {
    args: [null, null],
  })
  .catch((error) => {
    console.log(
      JSON.parse(error.data.message)
    );
    console.log(error.status); // 422
  });
````

### Error handling

Validation failure errors can be caught with Try/Catch.

```ts
try {
  // call the interface
} catch (error) {
  console.log(error.data.code); // VALIDATION_FAILED
  console.log(
    JSON.parse(error.data.message)
  );
}
````

`error.data.message` contains the complete [error message](https://zod.js.org/docs/errors/), you need to use `JSON.parse` to parse, the parsed example is as follows:

```ts
[
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'number',
    path: [0, 'name'],
    message:
      'Expected string, received number',
  },
];
````

in:

- `message`: error message
- The `path` parameter represents the error path. For example, `0` represents the first parameter validation error, and `name` represents the `name` field validation error.

You can manually parse the error message and display it to the user.

###ValidateHttp

ValidateHttp(options) supports passing in `options` parameters, the types are as follows.

```ts
type ValidateHttpOption = {
  query?: z.Schema<any>;
  params?: z.Schema<any>;
  headers?: z.Schema<any>;
  data?: z.Schema<any>[];
};
````

Take validating the `Query` parameter as an example.

Backend code:

```ts
import {
  APIs,
  Get,
  Query,
  useContext,
  ValidateHttp,
} from '@midwayjs/hooks';
import { z } from 'zod';

const QuerySchema = z. object({
  searchString: z.string().min(5),
});

export const filterPosts = Api(
  Get('/api/filterPosts'),
  Query<z.infer<typeof QuerySchema>>(),
  ValidateHttp({ query: QuerySchema }),
  async() => {
    const ctx = useContext();
    return ctx.query.searchString;
  }
);
````

All-in-one call:

```ts
import filterPosts from './api';

try {
  await filterPosts({
    query: { searchString: '' },
  });
} catch (error) {
  console.log(
    JSON.parse(error.data.message)
  );
  console.log(error.status); // 422
}
````

Manual call:

```ts
fetcher
  .get(
    '/api/filterPosts?searchString=1'
  )
  .catch((error) => {
    console.log(
      JSON.parse(error.data.message)
    );
    console.log(error.status); // 422
  });
````

## TypeScript support

You can use the built-in TypeScript function of zod to deduce and verify complex types.

An example is as follows:

```ts
import {
  APIs,
  Post,
  Validate,
} from '@midwayjs/hooks';
import { z } from 'zod';

const Project = z.object({
  name: z.string(),
  description: z.string(),
  owner: z.string(),
  members: z.array(z.string()),
});

export default Api(
  Post('/project'),
  Validate(Project),
  async (
    // { name: string, description: string, owner: string, members: string[] }
    project: z.infer<typeof Project>
  ) => {
    return project;
  }
);
````

All-in-one call:

```ts
import createProject from './api';

try {
  await createProject({
    name: 1,
    description: 'test project',
    owner: 'test',
    members: ['test'],
  });
} catch (error) {
  console.log(error.message);
  console.log(error.status); // 422
}
````

Manual call:

```ts
fetcher
  .post('/project', {
    args: [
      {
        name: 1,
        description: 'test project',
        owner: 'test',
        members: ['test'],
      },
    ],
  })
  .catch((error) => {
    console.log(
      JSON.parse(error.data.message)
    );
    console.log(error.status); // 422
  });
````