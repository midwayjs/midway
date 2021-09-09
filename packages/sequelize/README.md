# midway sequelize component

## How to use

in Configuration.ts file

```ts
@Configuration({
  imports: [
    '@midwayjs/sequelize',
  ],
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {
}

```

## Configuration

in config files


```ts
export const sequelize = {
  options: {
    database: 'test4',
    username: 'root',
    password: '123456',
    host: '127.0.0.1',
    port: 3306,
    encrypt: false,
    logging: console.log
  },
  sync: false
}
```

## Define EntityModel

```ts
import { Column, Model } from "sequelize-typescript";
import { BaseTable } from "@midwayjs/sequelize";

@BaseTable
export default class UserModel extends Model{
  @Column({
    comment: '名字'
  })
  name: string;
}

```


## Use Model

in code files

```ts
import { UserModel } from './model/user';

@Provide()
export class IndexHandler {

  @Func('index.handler')
  async handler() {
    const users = await this.UserModel.findAll();
    return users;
  }
}
```
