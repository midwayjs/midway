# midway typeorm component

## How to use

in Configuration.ts file

```ts
import * as typeorm from '@midwayjs/typeorm';
import { join } from 'path';

@Configuration({
  imports: [
    typeorm,
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
}

```

## Configuration

in config files

```ts
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '',
        port: 3306,
        username: '',
        password: '',
        database: undefined,
        synchronize: true,
        logging: false,
      }
    }
  }
};
```

## Define EntityModel

```ts
// model/user.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('test_user')
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
export class UserService {

  @InjectEntityModel(User)
  userModel: Repository<User>;

  async testUser() {
    const u = new User();
    u.name = 'oneuser1';
    const uu = await this.userModel.save(u);
    console.log('user one id = ', uu.id);

    const user = new User();
    user.id = 1;
    const users = await this.userModel.findAndCount({
      where: user
    });
    return 'hello world' + JSON.stringify(users);
  }
}
```
