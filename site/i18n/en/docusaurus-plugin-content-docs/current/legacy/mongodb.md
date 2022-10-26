# MongoDB

In this chapter, we choose [Typegoose](https://github.com/typegoose/typegoose) as the MongoDB ORM library based on it. As he described, "Define Mongoose models using TypeScript classes" is very well combined with TypeScript.

Simply put, Typegoose using TypeScript "wrappers" to write Mongoose models, most of its capabilities are provided by [mongoose](https://www.npmjs.com/package/mongoose) libraries.

You can also directly select the [mongoose](https://www.npmjs.com/package/mongoose) library to use, and we will describe it separately.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |


:::tip
This document is obsolete from v3.4.0.
:::

## Mongoose version dependency


The mongoose is also related to the version of MongoDB Server used by your server, as follows, please note.


- MongoDB Server 2.4.x: mongoose ^3.8 or 4.x
- MongoDB Server 2.6.x: mongoose ^3.8.8 or 4.x
- MongoDB Server 3.0.x: mongoose ^3.8.22, 4.x, or 5.x
- MongoDB Server 3.2.x: mongoose ^4.3.0 or 5.x
- MongoDB Server 3.4.x: mongoose ^4.7.3 or 5.x
- MongoDB Server 3.6.x: mongoose 5.x
- MongoDB Server 4.0.x: mongoose ^5.2.0
- MongoDB Server 4.2.x: mongoose ^5.7.0
- MongoDB Server 4.4.x: mongoose ^5.10.0
- MongoDB Server 5.x: mongoose ^6.0.0


**mongoose related dependencies are complex and correspond to different versions. At this stage, we mainly use mongoose v5 and v6.**


:::info
From mongoose@v5.11.0 on, mongoose the definition is officially supported, there is no need to install the @types/mongoose dependency package.
:::


The installation package depends on the following version:

**Support MongoDB Server 5.x**

```json
  "dependencies": {
    "mongoose": "^6.0.7 ",
    "@typegoose/typegoose": "9.0.0", // This dependency needs to be installed using typegoose
  },
```


**Support MongoDB Server 4.4.x**


The following versions do not require additional definition packages to be installed.
```json
  "dependencies": {
    "mongoose": "^5.13.3 ",
    "@typegoose/typegoose": "^8.0.0",   // This dependency needs to be installed using typegoose
  },
```


The following versions require additional definition packages to be installed (not recommended).
```json
 "dependencies": {
    "mongodb": "3.6.3", // The version is written inside the mongoose
    "mongoose": "~5.10.18 ",
    "@typegoose/typegoose": "7.0.0", // This dependency needs to be installed using typegoose
 },
 "devDependencies": {
    "@types/mongodb": "3.6.3", // this version can only be used
    "@types/mongoose": "~5.10.3 ",
 }
```


The remaining MongoDB installation modules are similar and have not been tested.


## Use Typegoose


### 1. Install components


Install Typegoose components to provide access to MongoDB.


**Please note that please check the first section to write/install mongoose and other related dependency packages in advance.**
```bash
$ npm i @midwayjs/typegoose@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    // Components
    "@midwayjs/typegoose": "^3.0.0",
    // mongoose dependency in the previous section
  },
  "devDependencies": {
    // mongoose dependency in the previous section
    // ...
  }
}
```



After installation, you need to manually configure `src/configuration.ts`. The code is as follows.

```typescript
// configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as typegoose from '@midwayjs/typegoose';

@Configuration({
  imports: [
    typegoose // Load typegoose Components
  ],
  importConfigs: [
  	join(__dirname, './config')
  ]
})
export class MainConfiguration {

}
```


:::info
In this component, midway just makes a simple configuration regularization and injects it into the initialization process.
:::


### 2. Configure connection information


Add the configuration of the connection to `src/config/config.default.ts`.

```typescript
export default {
  // ...
  mongoose: {
    client: {
      uri: 'mongodb://localhost:27017/test',
      options: {
        useNewUrlParser: true
        useUnifiedTopology: true
        user: '***********',
        pass: '***********'
      }
    }
  },
}
```


### 3. Simple directory structure


Let's take a simple project as an example. Please refer to other structures yourself.


```
MyProject
├── src              							// TS root directory
│   ├── config
│   │   └── config.default.ts 		// Application Profile
│   ├── entity       							// entity (database Model) directory
│   │   └── user.ts  					  	// entity file
│   ├── configuration.ts     			// Midway configuration file
│   └── service      							// Other Service directory
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```


Here, our database entities are mainly located in the `entity` directory (non-mandatory). This is a simple convention.


### 3. Create an entity file


```typescript
import { prop } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';

@EntityModel()
export class User {
  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}
```

Equivalent to the following code that uses the Mongoose

```typescript
const userSchema = new mongoose.Schema({
  name: String
  jobs: [{ type: String }]
});

const User = mongoose.model('User', userSchema);
```

:::info
Therefore, typegoose just simplify the process of creating model.
:::

### 4, reference entities, call the database.


The sample code is as follows:

```typescript
import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { User } from '../entity/user';

@Provide()
export class TestService {

  @InjectEntityModel(User)
  userModel: ReturnModelType<typeof User>;

  async getTest() {
    // create data
    const { _id: id } = await this.userModel.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User); // an "as" assertion, to have types for all properties

    // find data
    const user = await this.userModel.findById(id).exec();
    console.log(user)
  }
}
```


### 5, multi-Library situation


First configure multiple connections.


Add the configuration of the connection to `src/config/config.default.ts`, `default` represents the default connection.
```typescript
export default {
  // ...
  mongoose: {
    clients: {
      default: {
        uri: 'mongodb://localhost:27017/test',
        options: {
          useNewUrlParser: true
          useUnifiedTopology: true
          user: '***********',
          pass: '***********'
        }
      },
      Db1: {
        uri: 'mongodb://localhost:27017/test1',
        options: {
          useNewUrlParser: true
          useUnifiedTopology: true
          user: '***********',
          pass: '***********'
        }
      }
    }
  },
}
```


Use fixed connections when defining instances, such:
```typescript
@EntityModel() // default connection is used by default
class User {

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}

@EntityModel({
  connectionName: 'db1' // db1 connection is used here
})
class User2 {

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}
```


When in use, inject specific connections
```typescript
@Provide()
export class TestService {

  @InjectEntityModel(User)
  userModel: ReturnModelType<typeof User>;

  @InjectEntityModel(User2)
  user2Model: ReturnModelType<typeof User2>;

  async getTest() {
    const { _id: id } = await this.userModel.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User); // an "as" assertion, to have types for all properties
    const user = await this.userModel.findById(id).exec();
    console.log(user)

    const { _id: id2 } = await this.user2Model.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User2); // an "as" assertion, to have types for all properties
    const user2 = await this.user2Model.findById(id2).exec();
    console.log(user2)
  }
}

```


## Direct use of mongoose

mongoose component is the basic component of typegoose, sometimes we can use it directly.


### 1. Install components

**Please note that please check the first section to write/install mongoose and other related dependency packages in advance.**

```bash
$ npm i @midwayjs/mongoose --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    // Components
    "@midwayjs/mongoose": "^3.0.0",
    // mongoose dependency in the previous section
  },
  "devDependencies": {
    // mongoose dependency in the previous section
    // ...
  }
}
```



### 2. Open the components


After installation, you need to manually configure `src/configuration.ts`. The code is as follows.
```typescript
// configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as mongoose from '@midwayjs/mongoose';

@Configuration({
  imports: [
    mongoose // Load mongoose Components
  ],
  importConfigs: [
  	join(__dirname, './config')
  ]
})
export class MainConfiguration {

}
```




### 2. Configuration


Same as typegoose, or typegoose use mongoose configuration.


Single library:
```typescript
export default {
  // ...
  mongoose: {
    client: {
      uri: 'mongodb://localhost:27017/test',
      options: {
        useNewUrlParser: true
        useUnifiedTopology: true
        user: '***********',
        pass: '**********'
      }
    }
  },
}
```
Multi-library:
```typescript
export default {
  // ...
  mongoose: {
    clients: {
      default: {
        uri: 'mongodb://localhost:27017/test',
        options: {
          useNewUrlParser: true
          useUnifiedTopology: true
          user: '***********',
          pass: '***********'
        }
      },
      Db1: {
        uri: 'mongodb://localhost:27017/test1',
        options: {
          useNewUrlParser: true
          useUnifiedTopology: true
          user: '***********',
          pass: '***********'
        }
      }
    }
  },
}
```


### 3. Use


When there is only one default connection or the default connection is directly used, we can directly use the encapsulated `MongooseConnectionService` object to create the model.
```typescript
import { Provide, Inject } from '@midwayjs/decorator';
import { MongooseConnectionService } from '@midwayjs/mongoose';
import { Schema, Document } from 'mongoose';

interface User extends Document {
  name: string;
  email: string;
  avatar: string;
}

@Provide()
export class TestService {

  @Inject()
  conn: MongooseConnectionService;

  async invoke() {
    const schema = new Schema<User>({
      name: { type: String, required: true}
      email: { type: String, required: true}
      avatar: String
    });
    const UserModel = this.conn.model<User>('User', schema);
    const doc = new UserModel({
      name: 'Bill',
      email: 'bill@initech.com',
      avatar: 'https:// I .imgur.com/dM7Thhn.png'
    });
    await doc.save();
  }
}

```


If multiple other connections are configured, obtain the connection from the factory method before using it.
```typescript
import { MongooseConnectionServiceFactory } from '@midwayjs/mongoose';
import { Schema } from 'mongoose';

@Provide()
export class TestService {

  @Inject()
  connFactory: MongooseConnectionServiceFactory;

  async invoke() {
    // get db1 connection
    const conn = this.connFactory.get('db1');

    // get default connection
    const defaultConn = this.connFactory.get('default');

  }
}

```


## Frequently Asked Questions


### 1. E002: You are using a NodeJS Version below 12.22.0


Node version verification has been added to the new version @typegoose/typegoose (v8, v9). if your Node.js version is lower than v12.22.0, this prompt will appear.


Under normal circumstances, please upgrade Node.js to this version or above to solve the problem.


In special scenarios, such as when the Serverless cannot modify the Node.js version and the version is lower than v12.22, the v12 version can actually be subversions, which can be bypassed by temporarily modifying the process.version.


```typescript
// src/configuration.ts

Object.defineProperty(process, 'version', {
  value: 'v12.22.0',
  writable: true,
});

// other code

export class AutoConfiguration {}
```



