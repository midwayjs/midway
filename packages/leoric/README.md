# midway leoric component

this is a sub package for midway.

Document: [https://midwayjs.org](https://midwayjs.org)

## Usage

```ts
// src/configuration.ts
import { Configuration, ILifeCycle } from '@midwayjs/core';
import * as leoric from '@midwayjs/leoric';

@Configuration({
  imports: [
    leoric,
  ],

})
export class ContainerLifeCycle implements ILifeCycle {}
```

```ts
// src/config/config.default.ts
export default () => {
  return {
    leoric: {
      dataSource: {
        default: {
          dialect: 'sqlite',
          database: path.join(__dirname, '../../', 'database.sqlite'),
          sync: true,
          models: [
            '**/models/*{.ts,.js}'
          ]
        },
      },
    },
  }
}
```

```ts
// src/controller/user.ts
import { Controller } from '@midwayjs/core';
import { InjectModel } from '@midwayjs/leoric';
import User from '../model/user';

@Controller('/api/users')
export class UserController {
  @InjectModel(User)
  User: typeof User;

  @Get('/')
  async index() {
    return await this.User.order('id', 'desc').limit(10);
  }
}
```

## License

[MIT]((https://github.com/midwayjs/midway/blob/master/LICENSE))
