# midway orm component

## How to use

in Configuration.ts file

```ts
@Configuration({
  imports: [
    '@midwayjs/orm',
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
export default {
  orm: {
    type: 'mysql',
    host: '',
    port: 3306,
    username: '',
    password: '',
    database: undefined,
    synchronize: true,
    logging: false,
 }
};
```

or

```ts
export const orm = {
  type: 'sqlite',  // or use mysql see typeorm docs
  database: join(__dirname, './test.sqlite'),
  logging: true,
}
```

## Define EntityModel

```ts
// model/user.ts
import { EntityModel } from '@midwayjs/orm';
import { PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@EntityModel('test_user')
export class Photo {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "name" })
  name: string;

  @OneToMany(type => Message, message => message.sender)
  messages: Message[];
}
```


## Use Model

in code files

```ts
import { InjectEntityModel } from '@midwayjs/orm';
import { User } from './model/user';
import { Repository } from 'typeorm';

@Provide()
export class IndexHandler {

  @InjectEntityModel(User)
  userModel: Repository<User>;

  @Func('index.handler')
  async handler() {
    const u = new User();
    u.name = 'oneuser1';
    const uu = await this.userModel.save(u);
    console.log('user one id = ', uu.id);

    const user = new User();
    user.id = 1;
    const users = await this.userModel.findAndCount(user);
    return 'hello world' + JSON.stringify(users);
  }
}
```