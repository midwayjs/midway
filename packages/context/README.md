# Injection

[![Package Quality](http://npm.packagequality.com/shield/injection.svg)](http://packagequality.com/#?package=injection)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midwayjs/midway/pulls)

Injection is a powerful inversion of control container that is widely used in the midway framework and brings good user experience. 

## Installation

```bash
$ npm install injection reflect-metadata --save
```

Node.js >= 8.0.0 required.

> Injection requires TypeScript >= 2.0 and the experimentalDecorators, emitDecoratorMetadata, types and lib compilation options in your tsconfig.json file.

```json
{
    "compilerOptions": {
        "target": "ES2017",
        "lib": ["es2017", "dom"],
        "types": ["reflect-metadata"],
        "module": "commonjs",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

## Getting Started

```ts

import {container, provide, inject} from 'injection';

@provide('userModel')
class UserModel {

}

@provide('userService')
class UserService {
  
  @inject()
  private userModel;
  
  async getUser(uid) {
    // TODO
  }
}


const container = new Container();
container.bind(UserService);
container.bind(UserModel);

const userService = await container.getAsync('userService'); 
const data = await userService.getUser(123);
```

Document: [https://midwayjs.org/midway/ioc.html](https://midwayjs.org/midway/ioc.html#)

## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
