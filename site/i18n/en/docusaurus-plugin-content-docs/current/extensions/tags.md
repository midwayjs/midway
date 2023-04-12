# label components

Generic label components for `@midwayjs/faas`, `@midwayjs/web`, `@midwayjs/koa` and `@midwayjs/express` multiple frameworks.

### scenes to be used
Tags are an abstract server-side common systematization capability that can be used for various purposes, such as:
+ Organize and manage resources
     - Implement a taxonomy system (for content, crowd, etc.)
     - Resource management system
         + Add various color tags, object and scene tags to pictures, and filter pictures by tags
         + Video and other material tags
+ access control
     - Permissions system (admin, editor, guest)
+ status system (editing, published, etc.)

Based on the addition, deletion, modification and query provided by the tag system, as well as the addition, deletion, modification and query of `entities` bound to tags through tags, more advanced business logic can be easily implemented.

The labeling system is for this kind of business scenario, allowing the server to achieve more efficient and convenient business development based on labeling capabilities.

Related Information:

| web support | |
| ----------------- | ---- |
| @midwayjs/koa | ✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web | ✅ |
| @midwayjs/express | ✅ |


### how to use?

1. Install dependencies

```bash
$ npm i @midwayjs/tags --save
```

2. Introduce components in configuration

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as tags from '@midwayjs/tags';
@Configuration({
   imports: [
     //...
     tags
   ],
})
export class MainConfiguration {}
```

3. Add configuration

```typescript
// src/config/config.local.ts
export default {
   tags: {
     clients: {
       'tagGroup1': {
         // Use local memory as data storage
         dialectType: 'memory',
       },
     },
   }
}
```

4. Call in the code
```typescript
// src/testTags.ts
import { Provide, Inject, InjectClient } from '@midwayjs/core';
import { TagServiceFactory, TagClient } from '@midwayjs/tags';
@Provide()
export class TestTagsService {
   @Inject()
   tags: TagServiceFactory;

   // Equivalent to this.tags.get('tagGroup1')
   @InjectClient(TagServiceFactory, 'tagGroup1')
   tagClient: TagClient;

   @ServerlessTrigger(ServerlessTriggerType. HTTP, { path: '/tags/list', method: 'get'})
   async listTags() {
     // You can also use this.tagClient directly
     const tagClient: TagClient = this. tags. get('tagGroup1');
     // add new tag
     const tagInfo = await tagClient. new({
       name: 'test-tag-name',
       desc: 'tag desc',
     });
     /*
     tagInfo = {
       success: true,
       id: 1,
     }
     */
     // list top 20 tags
     const tags = await tagClient. list({ count: true });
     /*
     tags: {
       list: [
         {
           id: 1,
           name: 'test-tag-name',
           desc: 'tag desc'
         }
       ],
       total: 1
     }
     */
     return tags;
   }
}

```

### method

#### Add tag new

```typescript
new(tagDefine: {
   // Tag name, cannot be repeated in the same group
   name: string;
   // label description
   desc?: string;
}): Promise<{
   success: boolean;
   message: string;
   // label id
   id?: number;
}>;
```
#### Remove tags remove
Deleting a label will also delete the entity relationship bound to this label

```typescript
remove(tagIdOrName: number | string): Promise<{
   success: boolean;
   message: string;
   // label id
   id?: number;
}>;
```
#### Update tag update
Fine-tune the basic information of a label
```typescript
update(tagIdOrName: number | string, params: Partial< {
   name: string;
   desc?: string;
}>): Promise<{
   success: boolean;
   message: string;
   // label id
   id?: number;
}>;
```
#### Enumerate tags list
Search tags, support pagination

```typescript
list(listOptions?: {
   // Search tags, support passing in tag id and tag name
   tags?: Array<number | string>;
   // When searching, whether to use the intersection or union of the tags, the values are and and or
   type?: MATCH_TYPE;
   count?: boolean;
   pageSize?: number;
   page?: number;
}): Promise<{
   // label list
   list: {
     id: number;
     name: string;
     desc: string;
     createAt: number;
     updateAt: number;
   }[];
   // total number of tags
   total?: number;
}>;
```
#### Binding entity bind
Binding an entity means binding anything else to a label. The entity here can be a picture or a file. The id of the entity is controlled by the user

```typescript
bind(bindOptions: {
   // label list
   tags: Array<number | string>;
   // If there is no label, automatically create a label and bind it, the default is false
   autoCreateTag?: boolean;
   // entity id
   objectId: number,
}): Promise<{
   success: boolean;
   message: string;
}>
```
#### Unbind entity unbind

```typescript
unbind(unbindOptions: {
   // Unbound multiple tags, tag id or tag name
   tags: Array<number | string>,
   // entity id
   objectId: number,
}): Promise<{
   success: boolean;
   message: string;
}>
```
#### List entities by label listObjects

```typescript
listObjects(listOptions?: {
   // tag id or tag name
   tags?: Array<string|number>;
   count?: boolean;
   // When searching, whether to use the intersection or union of the tags, the values are and and or
   type?: MATCH_TYPE;
   pageSize?: number;
   page?: number;
}): Promise<{
   // list of entity ids
   list: number[];
   // total number of entities
   total?: number;
}>;
```
#### Obtain tags based on entities listObjectTags


```typescript
listObjectTags(listOptions?: {
   // entity id
   objectId: number;
   count?: boolean;
   pageSize?: number;
   page?: number;

}): Promise<{
   list: { // label list
     name: string;
     desc?: string;
     id: number;
     createAt: number;
     updateAt: number;
   }[];
   // total number of tags
   total?: number;
}>;
```
### configuration

Tags supports memory storage (default) and mysql database storage. The following is a configuration example:
```typescript
// src/config/config.local.ts
export default {
   tags: {
     clients: {
       'tagGroup1': {
         // Use local memory as data storage
         dialectType: 'memory',
       },
       'tagGroup2': {
         // use mysql as data store
         dialectType: 'mysql',
         // Automatically synchronize the table structure
         sync: true,
         // mysql connection instance
         instance: mysqlConnection. promise(),
       },
     },
   }
}
```
#### Memory storage configuration

| Configuration | Value Type | Default Value | Configuration Description |
| -- | -- | -- | -- |
| dialectType | string `memory` | - | Configured as `memory`, enable memory storage |

#### Mysql storage configuration

If you want to use Mysql database as data storage, you need to pass Mysql's `database connection object` into the configuration of tags.


| Configuration | Value Type | Default Value | Configuration Description |
| -- | -- | -- | -- |
| dialectType | string `mysql` | - | Configure to `mysql`, then enable Mysql storage |
| sync | boolean | `false` | Automatically synchronize the table structure of Tags, the Tags component will create two data tables, see the data table information below for details |
| instance | `{ query: (sql: string, placeholder?: any[])}: Promise<[]>` | - | Mysql connection example, need to provide a query method, you can check the example below |
| tablePrefix | string | - | data table prefix |
| tableSeparator | string | `_` | splicing separator of data table |

The following is an example of database connection using `mysql2` npm package:

```typescript
// src/config/config.local.ts
const mysql = require('mysql2');
export default () => {
   const connection = mysql.createConnection({
       host: 'db4free.net',
       user: 'tag***',
       password: 'tag***',
       database: 'tag***',
       charset: 'utf8',
   });
   return {
     tags: {
       clients: {
         'tagGroup': {
           dialectType: 'mysql',
           sync: true,
           instance: { // mysql connection instance containing query
             query: (...args) => {
               return connection.promise().query(...args);
             }
           },
         },
       },
     }
   }
}
```

You can also consider making the database connection in the `onConfigLoad` life cycle in `configuration.ts`, the advantage of this is that the database connection can be closed when it is closed:

```typescript
// src/configuration.ts
import { Config, Configuration } from '@midwayjs/core';
import { join } from 'path';
import * as tags from '@midwayjs/tags';
import { ITagMysqlDialectOption } from '@midwayjs/tags';
const mysql = require('mysql2');

@Configuration({
   imports: [
     tags
   ],
})
export class MainConfiguration {
   connection;

   @Config()
   tags;

   async onConfigLoad(container) {
     // create mysql connection
     this.connection = mysql.createConnection({
       host: 'db4free.net',
       user: 'tag***',
       password: 'tag***',
       database: 'tag***',
       charset: 'utf8',
     });
     let dialect: ITagMysqlDialectOption = {
       dialectType: 'mysql',
       sync: true,
       instance: {
         query: (...args) => {
           return this.connection.promise().query(...args);
         }
       }
     };

     return {
       tags: dialect
     }
   }

   async onStop() {
     // close mysql connection
     this.connection.close();
   }
}

```


##### Data table information

The Tags component needs two data tables to store data, namely `tag` and `relationship`. The real table names of these two tables in the database are through the `table name prefix` and `table name separator` in the configuration. Spliced with `client name/group name`, for example:


```typescript
const clientName = 'local-test';
const { tablePrefix = 'a', tableSeparator = '_' } = tagOptions;
const tagTableName = `${tablePrefix}${tableSeparator}${clientName}${tableSeparator}tag`;
// tagTableName: a_local-test_tag
const relationshipTableName = `${tablePrefix}${tableSeparator}${clientName}${tableSeparator}relationship`
// relationshipTableName: a_local-test-relationship
```


When you enable the automatic table structure synchronization of `sync` in the configuration, if there are no these two tables, the corresponding data table will be created according to the following table structure:

`tag` table structure:
```sql
CREATE TABLE `tag` (
     `id` BIGINT unsigned NOT NULL AUTO_INCREMENT,
     `group` varchar(32) NULL,
     `name` varchar(32) NULL,
     `descri` varchar(128) NULL,
     `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     `update_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
     PRIMARY KEY (id)
)
```
`relationship` table structure:
```sql
CREATE TABLE `relationship` (
    `id` BIGINT unsigned NOT NULL AUTO_INCREMENT,
    `tid` BIGINT unsigned NOT NULL,
    `oid` BIGINT unsigned NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `update_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP  ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
)
```
