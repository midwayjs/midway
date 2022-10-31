# MongoDB

In this chapter, we choose [Typegoose](https://github.com/typegoose/typegoose) as the base MongoDB ORM library. As he describes "Define Mongoose models using TypeScript classes", it works well with TypeScript.

Simply put, Typegoose using TypeScript "wrappers" to write Mongoose models, most of its capabilities are provided by [mongoose](https://www.npmjs.com/package/mongoose) libraries.

You can also directly select the [mongoose](https://www.npmjs.com/package/mongoose) library to use, and we will describe it separately.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |


:::tip

- 1. The current module has been reconfigured since v3.4.0, and the historical writing method is compatible. For more information about how to query historical documents, see [here](../legacy/mongodb).
- 2. If there is a read configuration in the code, note that the `mongoose.clients` may not be read, please use the `mongoose.dataSource`.

:::



## The difference with the old writing

If you want to use the new version of the usage, please refer to the following process to modify the old code. Do not mix the new and old codes.

Upgrade method:

- 1. No need to use `EntityModel` decorator
- 3. configure the adjustment in the `mongoose` section of `src/config.default`. refer to the following data source configuration section
   - The 3.1 is modified to the form of a data source to `mongoose.dataSource`
   - 3.2 declare the entity model in the `entities` field of the data source




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
    "@typegoose/typegoose": "8.0.0", // This dependency needs to be installed using typegoose
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


The rest of the MongoDB installation modules are similar and not tested.



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



After installation, you need to manually configure it in `src/configuration.ts`, the code is as follows.

```typescript
// src/configuration.ts
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

### 2. Simple directory structure


We take a simple project as an example, please refer to other structures.


```text
MyProject
├── src              							// TS root directory
│   ├── config
│   │   └── config.default.ts 		// Application Profile
│   ├── entity       							// entity (database Model) directory
│   │   └── user.ts  					  	// entity file
│   ├── configuration.ts     			// Midway configuration file
│   └── service      							// Other service directory
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```


Here, our database entities are mainly located in the `entity` directory (non-mandatory). This is a simple convention.



### 3. Create entity files

For example, in `src/entity/user.ts`.


```typescript
import { prop } from '@typegoose/typegoose';

export class User {
  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}
```

Equivalent to the following code that uses the mongoose

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




### 4. Configure connection information


Add the configuration of the connection to `src/config/config.default.ts`.

```typescript
import { User } from '../entity/user';

export default {
  // ...
  mongoose: {
    dataSource: {
      default: {
        uri: 'mongodb://localhost:27017/test',
        options: {
          useNewUrlParser: true
          useUnifiedTopology: true
          user: '***********',
          pass: '***********'
        },
        // Associated Entities
        entities: [ User]
      }
    }
  },
}
```

For more information, see [Data source management](../data_source).



### 5, reference the entity, call the database.


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


### 6, Multi-dataSource situation

First define multiple entities.

```typescript
class User {

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}

class User2 {

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}
```


Configure entities to multiple data sources.


Add the configuration of the data source to `src/config/config.default.ts`.
```typescript
import { User, User2 } from '../entity/user';

export default {
  // ...
  mongoose: {
    dataSource: {
      default: {
        uri: 'mongodb://localhost:27017/test',
        options: {
          useNewUrlParser: true
          useUnifiedTopology: true
          user: '***********',
          pass: '***********'
        },
        entities: [ User]
      },
      db1: {
        uri: 'mongodb://localhost:27017/test1',
        options: {
          useNewUrlParser: true
          useUnifiedTopology: true
          user: '***********',
          pass: '***********'
        },
        entities: [ User2]
      }
    }
  },
}
```


Use a fixed connection when defining an instance, and configure the Model to automatically associate the mongoose connection when scanning the dataSource (`getModelForClass(Model, { existingConnection: conn })`).
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



### 7. About schemaOptions

Typegoose reserved a `setGlobalOptions` method to set up [schemaOptions](https://typegoose.github.io/typegoose/docs/api/decorators/model-options#schemaoptions) and some other global [configurations](https://typegoose.github.io/typegoose/docs/api/decorators/model-options#options-1).

We can set it up when the project starts.

```typescript
// srcconfiguration.ts
import { Configuration } from '@midwayjs/decorator';
import * as typegoose from '@midwayjs/typegoose';
import * as Typegoose from '@typegoose/typegoose';

@Configuration({
  // ...
})
export class MainConfiguration {
  async onReady() {

    Typegoose.setGlobalOptions({
      schemaOptions: {
        // ...
      },
      options: { allowMixed: Severity.ERROR}
    });
    // ...
  }
}
```





## Direct use of mongoose

mongoose component is the basic component of typegoose, sometimes we can use it directly.


### 1. Install components


**Please note that please check the first section to write/install mongoose and other related dependency packages in advance.**

```bash
$ npm i @midwayjs/mongoose@3 --save
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
    mongoose  											// enable mongoose component
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

Whether it is a single database or a multi-database, the data source configuration is similar.


Single library:
```typescript
export default {
  // ...
  mongoose: {
    dataSource: {
      default: {
        uri: 'mongodb://localhost:27017/test',
        options: {
          useNewUrlParser: true
          useUnifiedTopology: true
          user: '***********',
          pass: '**********'
        }
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
    dataSource: {
      default: {
        uri: 'mongodb://localhost:27017/test',
        options: {
          useNewUrlParser: true
          useUnifiedTopology: true
          user: '***********',
          pass: '***********'
        }
      },
      db1: {
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
import { Provide, Inject, Init } from '@midwayjs/decorator';
import { MongooseDataSourceManager } from '@midwayjs/mongoose';
import { Schema, Document } from 'mongoose';

interface User extends Document {
  name: string;
  email: string;
  avatar: string;
}

@Provide()
export class TestService {

  @Inject()
  dataSourceManager: MongooseDataSourceManager;

  @Init()
  async init() {
    // get default connection
    this.conn = this.dataSourceManager.getDataSource('default');
  }

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






## Frequently Asked Questions


### 1. E002: You are using a NodeJS Version below 12.22.0


Node version verification has been added to the new version @typegoose/typegoose (v8, v9). if your Node.js version is lower than v12.22.0, this prompt will appear.


Under normal circumstances, please upgrade Node.js to this version or above to solve the problem.


In special scenarios, such as when the Serverless cannot modify the Node.js version and the version is lower than v12.22, the V12 version can actually be subversions, which can be bypassed by temporarily modifying the process.version.


```typescript
// src/configuration.ts

Object.defineProperty(process, 'version', {
  value: 'v12.22.0',
  }
});

// other code

export class AutoConfiguration {}
```



