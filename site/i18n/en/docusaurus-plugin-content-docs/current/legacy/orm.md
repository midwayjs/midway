# TypeORM

[TypeORM](https://github.com/typeorm/typeorm) is the most mature object relation mapper (`ORM`) in the existing community of `node.js`. Midway and TypeORM match to make development easier.

:::tip
This document is obsolete from v3.4.0.
:::

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |




## Installation Components


Install orm components to provide database ORM capabilities.


```bash
$ npm i @midwayjs/orm@3 typeorm --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/orm": "^3.0.0",
    "typeorm": "~0.3.0 ",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



## Enable component


Introducing orm components in `src/configuration.ts`, an example is as follows.

```typescript
// configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as orm from '@midwayjs/orm';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    orm // load orm components
  ],
  importConfigs: [
  	join(__dirname, './config')
  ]
})
export class ContainerConfiguratin {

}
```



## Install database Driver


The commonly used database drivers are as follows. Select the database type to install the corresponding connection:

```bash
# for MySQL or MariaDB, you can also use mysql2 instead
npm install mysql --save
npm install mysql2 --save

# for PostgreSQL or CockroachDB
npm install pg --save

# for SQLite
npm install sqlite3 --save

# for Microsoft SQL Server
npm install mssql --save

# for SQL .js
npm install SQL .js --save

# for Oracle
npm install oracledb --save

# for MongoDB(experimental)
npm install mongodb --save
```

:::info
To make the** Oracle driver work**, you need to follow the installation instructions from [their](https://github.com/oracle/node-oracledb) site.
:::




## Simple directory structure


Let's take a simple project as an example. Please refer to other structures yourself.


```
MyProject
├── src              							// TS root directory
│   ├── config
│   │   └── config.default.ts 		// Application Profile
│   ├── entity       							// entity (database Model) directory
│   │   └── photo.ts  					  // entity file
│   │   └── photoMetadata.ts
│   ├── configuration.ts     			// Midway configuration file
│   └── service      							// Other service directory
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```




Here, our database entities are mainly located in the `entity` directory (non-mandatory). This is a simple convention.



## Getting Started

Next, we will take mysql as an example.




### 1. Create Model


We associate the model with the database. The model in the application is the database table. In TypeORM, the model is bound to the entity. Each Entity file is a Model and an Entity.


In the example, you need an entity. Let's take `photo` as an example. Create an entity directory and add the entity file `photo.ts` to the entity directory. A simple entity is as follows.

```typescript
// entity/photo.ts
export class Photo {
  id: number;
  name: string;
  description: string;
  filename: string;
  views: number;
  isPublished: boolean;
}
```

Note that each attribute of the entity file here is actually one-to-one corresponding to the database table. Based on the existing database table, we add content up.


### 2. Add a solid model decorator


We use `EntityModel` to define an entity model class.

```typescript
// entity/photo.ts
import { EntityModel } from '@midwayjs/orm';

@EntityModel('photo')
export class Photo {
  id: number;
  name: string;
  description: string;
  filename: string;
  views: number;
  isPublished: boolean;
}
```

:::caution
Note that the EntityModel here is a special decorator packaged by midway, in order to better combine with midway. Please do not directly use Entity in the typeorm.
:::


If the table name is different from the current entity name, you can specify it in the parameter.

```typescript
// entity/photo.ts
import { EntityModel } from '@midwayjs/orm';

@EntityModel('photo_table_name')
export class Photo {
  id: number;
  name: string;
  description: string;
  filename: string;
  views: number;
  isPublished: boolean;
}
```


These entity columns can also be generated using [typeorm_generator](/docs/tool/typeorm_generator) tools.


### 3. Add database columns


Attributes are decorated with the `@Column` decorator provided by typeorm, and each attribute corresponds to a column.


```typescript
// entity/photo.ts
import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';

@EntityModel()
export class Photo {

  @Column()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  filename: string;

  @Column()
  views: number;

  @Column()
  isPublished: boolean;

}
```

The `id`, `name`, `description`, `filename`, `views`, `isPublished` columns are added to the `photo` table. The column types in the database are inferred according to the attribute types you use, for example, number will be converted to integers, strings will be converted to varchar, boolean values will be converted to bool, and so on. However, you can use any column type supported by the database by explicitly specifying the column type in the `@Column` decorator.


We generated a database table with columns, but there is one thing left. Each database table must have a column with a primary key.


Database columns include more column options (ColumnOptions), such as modifying column names, specifying column types, and column lengths. For more options, see the [official documentation](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/entities.md#%E5%88% 97% E9%80% 89% E9%A1%B9).




### 4. Create a primary key column


Each entity must have at least one primary key column. To make a column a primary key, you need to use the `@PrimaryColumn` decorator.


```typescript
// entity/photo.ts
import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryColumn } from 'typeorm';

@EntityModel()
export class Photo {

  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  filename: string;

  @Column()
  views: number;

  @Column()
  isPublished: boolean;

}
```

### 5. Create a self-increasing primary key column


Now, if you want to set the self-increasing id column, you need to change the `@PrimaryColumn` decorator to the `@PrimaryGeneratedColumn` decorator:

```typescript
// entity/photo.ts
import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

@EntityModel()
export class Photo {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  filename: string;

  @Column()
  views: number;

  @Column()
  isPublished: boolean;

}
```


### 6. Column data type


Next, let's adjust the data type. By default, strings map to types similar to `varchar(255)` (depending on the database type).  Number is mapped to an integer-like type (depending on the database type). However, we do not want all columns to be limited to varchars or integers. Some changes can be made at this time.


```typescript
// entity/photo.ts
import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

@EntityModel()
export class Photo {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
  	length: 100
  })
  name: string;

  @Column('text')
  description: string;

  @Column()
  filename: string;

  @Column("double")
  views: number;

  @Column()
  isPublished: boolean;

}
```


Example, different column names

```typescript
@Column({
  length: 100
  name: 'custom_name'
})
name: string;
```


In addition, there are several special column types that can be used:


- `@CreateDateColumn` is a special column that automatically inserts dates for entities.
- The `@UpdateDateColumn` is a special column that automatically updates the entity date each time the entity manager or save of the repository is called.
- The `@VersionColumn` is a special column that automatically increases the entity version (increment number) each time the entity manager or save of the repository is called.
- `@DeleteDateColumn` is a special column that automatically sets the deletion time of the entity when soft-delete is called.

The column type is database-specific. You can set any column type supported by the database. For more information about supported column types, see [here](https://github.com/typeorm/typeorm/blob/master/docs/entities.md#column-types).

:::tip

`CreateDateColumn` and `UpdateDateColumn` rely on the insertion date function of creating the default data on the column when the table structure is synchronized for the first time. If the table is created by yourself, you need to add the default data to the column.

:::




### 7. Configure connection information


Please refer to the [Configuration](/docs/env_config) chapter to add configuration files.


Then configure the database connection information in `config.default.ts`.

```typescript
// src/config/config.default.ts
export default {
  // ...
  orm: {
    /**
     * Single database instance
     */
    type: 'mysql',
    host: '',
    port: 3306
    username: '',
    password: '',
    database: undefined
    synchronize: false, // If the table does not exist for the first time, you can write true if you need synchronization.
    logging: false
  },
}
```

utc time is stored by default (recommended).


Time zone can also be configured (not recommended)

```typescript
// src/config/config.default.ts
export default {
  // ...
  orm: {
    // ...
  	timezone: '+08:00',
  },
}
```


You can use other database types for this `type` field, including `mysql`, `mariadb`, `postgres`, `cockroachdb`, `sqlite`, `mssql`, `oracle`, `cordova`, `nativescript`, `react-native`, `expo`, or `mongodb`


For example, sqlite only needs the following information.


```typescript
// src/config/config.default.ts
export default {
  // ...
  orm: {
    type: 'sqlite',
    database: path.join(__dirname, '../../test.sqlite')
    synchronize: true
    logging: true
  },
}
```


:::info
Note: synchronize fields are used to synchronize table structures. It is not safe to use `synchronize: true` for production mode synchronization. Please set this field to false after going online.
:::


### 8. Use Model to insert database data


In common Midway files, use the `@InjectEntityModel` decorator to inject our configured Model. All we need to do is:


- 1. Create entity objects
- 2. Execute the `save()`

```typescript
import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from '../entity/photo';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  // save
  async savePhoto() {
    // create a entity object
    let photo = new Photo();
    photo.name = 'Me and Bears';
    photo.description = 'I am near polar bears';
    photo.filename = 'photo-with-bears.jpg';
    photo.views = 1;
    photo.isPublished = true;

    // save entity
    const photoResult = await this.photoModel.save(photo);

    // save success
    console.log('photo id =', photoResult.id);
  }
}
```


### 9. Query Data

For more information, see [find documentation](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/find-options.md).

The query API has changed since typeorm@0.3.0.

```typescript
import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from '../entity/photo';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  // find
  async findPhotos() {

    // find All
    let allPhotos = await this.photoModel.find(); // v0.2.x
    let allPhotos = await this.photoModel.find({}); // v0.3.x
    console.log("All photos from the db: ", allPhotos);

    // find first
    let firstPhoto = await this.photoModel.findOne(1);
    let firstPhoto = await this.photoModel.findOne({ // v0.3.x
      where: {
        id: 1
      }
    });
    console.log("First photo from the db: ", firstPhoto);

    // find one by name
    // v0.2.x
    let meAndBearsPhoto = await this.photoModel.findOne({ name: "Me and Bears" });
    // v0.3.x
    let meAndBearsPhoto = await this.photoModel.findOne({
      where: { name: "Me and Bears"}
    });
    console.log("Me and Bears photo from the db: ", meAndBearsPhoto);

    // find by views
    // v0.2.x
    let allViewedPhotos = await this.photoModel.find({ views: 1 });
    // v0.3.x
    let allViewedPhotos = await this.photoModel.find({
      where: { views: 1}
    });
    console.log("All viewed photos: ", allViewedPhotos);

    // v0.2.x
    let allViewedPhotos = await this.photoModel.find({ views: 1 });
    // v0.3.x
    let allPublishedPhotos = await this.photoModel.find({
      where: { isPublished: true}
    });
    console.log("All published photos: ", allPublishedPhotos);

  	// find and get count
    // v0.2.x
    let [allPhotos, photosCount] = await this.photoModel.findAndCount();
    // v0.3.x
    let [allPhotos, photosCount] = await this.photoModel.findAndCount({});
    console.log("All photos: ", allPhotos);
    console.log("Photos count: ", photosCount);

  }
}

```


### 10. Update the database


Now, let's load a photo from the database, update it and save it.


```typescript
import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from '../entity/photo';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  async updatePhoto() {

    let photoToUpdate = await this.photoModel.findOne(1);
    photoToUpdate.name = "Me, my friends and polar bears";

    await this.photoModel.save(photoToUpdate);
  }
}
```


### 11. Delete data


```typescript
import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from '../entity/photo';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  async updatePhoto() {
    /*...*/
    let photoToRemove = await this.photoModel.findOne(1); // typeorm@0.2.x
    await this.photoModel.remove(photoToRemove);
  }
}
```

Now, Photo with ID = 1 will be deleted from the database.


There is also a soft deletion method.

```typescript
await this.photoModel.softDelete(1);
```


### 12. Create a one-to-one association


Let's create a one-to-one relationship with another class. Let's create a new class in `entity/photoMetadata.ts`. This class contains additional meta-information for photo.


```typescript
import { Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { EntityModel } from '@midwayjs/orm';
import { Photo } from "./photo";

@EntityModel()
export class PhotoMetadata {

  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  height: number;

  @Column("int")
  width: number;

  @Column()
  orientation: string;

  @Column()
  compressed: boolean;

  @Column()
  comment: string;

  @OneToOne(type => Photo)
  @JoinColumn()
  photo: Photo;

}
```


Here, we use a new fitting called `@OneToOne`. It allows us to create a one-to-one relationship between two entities. `type => photo` is a function that returns the class of the entity with which we want to establish a relationship.


Due to the particularity of the language, we are forced to use a function that returns the class instead of using the class directly. You can also write it as `() => Photo`, but we use `type => Photo` as a convention to improve the readability of the code. The type variable itself contains nothing.


We also added an `@JoinColumn` decorator, which indicates that this side of the relationship will have the relationship. Relationships can be one-way or two-way. The relationship can only be owned by one party. The owner side of the relationship needs to use the @JoinColumn decorator.  If you run the application, you will see a newly generated table that will contain a column containing foreign keys for the Photo relationship.


```
+-------------+--------------+----------------------------+
|                     photo_metadata                      |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| height      | int(11)      |                            |
| width       | int(11)      |                            |
| comment     | varchar(255) |                            |
| compressed  | boolean      |                            |
| orientation | varchar(255) |                            |
| photoId     | int(11)      | FOREIGN KEY                |
+-------------+--------------+----------------------------+
```


Next we will associate them in the code.


```typescript
import { Provide, Inject, Func } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from './entity/photo';
import { PhotoMetadata } from './entity/photoMetadata';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  @InjectEntityModel(PhotoMetadata)
  photoMetadataModel: Repository<PhotoMetadata>;

  async updatePhoto() {

  // create a photo
    let photo = new Photo();
    photo.name = "Me and Bears";
    photo.description = "I am near polar bears";
    photo.filename = "photo-with-bears.jpg";
    photo.isPublished = true;

    // create a photo metadata
    let metadata = new PhotoMetadata();
    metadata.height = 640;
    metadata.width = 480;
    metadata.compressed = true;
    metadata.comment = "cybershoot";
    metadata.orientation = "portrait";
    metadata.photo = photo; // this way we connect them


    // first we should save a photo
    await this.photoModel.save(photo);

    // photo is saved. Now we need to save a photo metadata
    await this.photoMetadataModel.save(metadata);

    // done
    console.log("Metadata is saved, and relation between metadata and photo is created in the database too");
  }
}
```


### 13. Reverse relation mapping


Relational mapping can be one-way or two-way. When the relationship between PhotoMetadata and Photo is one-way. The owner of the relationship is PhotoMetadata, and Photo knows nothing about PhotoMetadata. This complicates accessing PhotoMetadata from the Photo side. To solve this problem, we add a reverse relational mapping to make the PhotoMetadata and Photo a two-way association. Let's modify our entity.


```typescript
import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Photo } from './photo';

@EntityModel()
export class PhotoMetadata {

  /* ... other columns */

  @OneToOne(type => Photo, photo => photo.metadata)
  @JoinColumn()
  photo: Photo;
}
```

```typescript
import { EntityModel } from '@midwayjs/orm';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { PhotoMetadata } from './photoMetadata';

@EntityModel()
export class Photo {

  /* ... other columns */

  @OneToOne(type => PhotoMetadata, photoMetadata => photoMetadata.photo)
  metadata: PhotoMetadata;
}
```

`photo => photo.metadata` is a function that returns a reverse mapping relationship. Here, we explicitly declare the metadata property of the Photo class to associate PhotoMetadata. In addition to passing functions that return the photo property, you can also pass strings directly to the `@OneToOne` decorator, such as `"metadata"` . But we use this method of function callback to make our code writing easier.


Note that the `@JoinColumn` decorator will only be used on one side of the relationship map. No matter which side of this decorator you place, you are the owner of the relationship. The owner of the relationship contains columns with foreign keys in the database.


### 14. Load objects and their dependencies


Now, let's try to load out Photo and PhotoMetadata together in a single query. There are two ways to do this, using the `find *` method or using the `QueryBuilder` function. Let's use the `find *` method first. The `find*` methods allow you to specify objects using the `FindOneOptions` / `FindManyOptions` interfaces.


```typescript
import { Provide, Inject, Func } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from './entity/photo';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  // find
  async findPhoto() {
		/*...*/
    let photos = await this.photoModel.find({ relations: [ 'metadata' ] }); // typeorm@0.2.x
  }
}

```

Here, the value of photos is an array containing the query results for the entire database, and each photo object contains its associated metadata property. Learn more about `Find Options` in [this documentation](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md).


`Find Options` is simple, but if you need more complex queries, you should use `QueryBuilder` instead.  `QueryBuilder` allows more complex queries to be used in an elegant way.


```typescript
import { Provide, Inject, Func } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from './entity/photo';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  // find
  async findPhoto() {
		/*...*/
    let photos = await this.photoModel
            .createQueryBuilder('photo')
            .innerJoinAndSelect('photo.metadata', 'metadata')
            .getMany();
  }
}
```

`QueryBuilder` allows the creation and execution of almost any complex SQL query. When using `QueryBuilder`, think like creating SQL queries. In this example, "photo" and "metadata" are aliases applied to the selected photos. You can use aliases to access the columns and properties of the selected data.


### 15. Use cascade operations to automatically save associated objects


Cascade can be set in the relationship when we want to automatically save the associated object every time we save another object. Let's slightly change the `@OneToOne` decorator of the photo.


```typescript
export class Photo {
  /// ... other columns

  @OneToOne(type => PhotoMetadata, metadata => metadata.photo, {
    cascade: true,
  })
  metadata: PhotoMetadata;
}
```

Using `cascade` allows us to no longer save Photo and PhotoMetadata separately now. Due to the cascade option, metadata objects will be saved automatically.


```typescript
import { Provide, Inject, Func } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from './entity/photo';
import { PhotoMetadata } from './entity/photoMetadata';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  async updatePhoto() {

   // create photo object
    let photo = new Photo();
    photo.name = "Me and Bears";
    photo.description = "I am near polar bears";
    photo.filename = "photo-with-bears.jpg";
    photo.isPublished = true;

    // create photo metadata object
    let metadata = new PhotoMetadata();
    metadata.height = 640;
    metadata.width = 480;
    metadata.compressed = true;
    metadata.comment = "cybershoot";
    metadata.orientation = "portrait";

    photo.metadata = metadata; // this way we connect them

    // save a photo also save the metadata
    await this.photoModel.save(photo);

    // done
    console.log("Photo is saved, photo metadata is saved too");
  }
}
```


Note that we now set the metadata of Photo instead of setting the Photo attribute of metadata as before. This is only valid when you connect Photo to the PhotoMetadata from the Photo side. If set on the PhotoMetadata side, it will not be saved automatically.


### 16. Create many-to-one/one-to-many associations


Let's create a many-to-one/one-to-many relationship. Suppose a photo has an author, and each author can have many photos. First, let's create an Author class:

```typescript
import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from "typeorm";
import { Photo } from './entity/photo';

@EntityModel()
export class Author {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(type => Photo, photo => photo.author) // note: we will create author property in the Photo class below
  photos: Photo[];
}
```

`Author` contains a reverse relationship.  `OneToMany` and `ManyToOne` need to appear in pairs.


Now, add the owner of the relationship to the Photo entity:

```typescript
import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { PhotoMetadata } from "./photoMetadata";
import { Author } from "./author";

@Entity()
export class Photo {

  /* ... other columns */

  @ManyToOne(type => Author, author => author.photos)
  author: Author;
}
```


In a many-to-one/one-to-many relationship, the owner is always many-to-one. This means that the class using the `@ManyToOne` will store the ID of the related object.


After the application is run, ORM creates the `author` table:


```
+-------------+--------------+----------------------------+
|                          author                         |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

It also modifies the `photo` table, adds a new `author` column, and creates a foreign key for it:

```
+-------------+--------------+----------------------------+
|                         photo                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
| description | varchar(255) |                            |
| filename    | varchar(255) |                            |
| isPublished | boolean      |                            |
| authorId    | int(11)      | FOREIGN KEY                |
+-------------+--------------+----------------------------+
```


### 17. Create many-to-many associations


Let's create a many-to-one/many-to-many relationship. Suppose a photo can be in many albums, and each album can contain many photos. Let's create an `Album` class.


```typescript
import { EntityModel } from '@midwayjs/orm';
import { PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";

@EntityModel()
export class Album {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(type => Photo, photo => photo.albums)
  @JoinTable()
  photos: Photo[];
}
```


`@JoinTable` is used to indicate that this is the owner of the relationship.


Now, add the reverse association to `Photo`.


```typescript
export class Photo {
  /// ... other columns

  @ManyToMany(type => Album, album => album.photos)
  albums: Album[];
}
```

After running the application, ORM will create a album_photos_photo_albums join table:


```
+-------------+--------------+----------------------------+
|                album_photos_photo_albums                |
+-------------+--------------+----------------------------+
| album_id    | int(11)      | PRIMARY KEY FOREIGN KEY    |
| photo_id    | int(11)      | PRIMARY KEY FOREIGN KEY    |
+-------------+--------------+----------------------------+
```


Now, let's insert albums and photos into the database:


```typescript
import { Provide, Inject, Func } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from './entity/photo';
import { PhotoMetadata } from './entity/photoMetadata';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  @InjectEntityModel(Album)
  albumModel: Repository<Album>

  async updatePhoto() {

    // create a few albums
    let album1 = new Album();
    album1.name = "Bears";
    await this.albumModel.save(album1);

    let album2 = new Album();
    album2.name = "Me";
    await this.albumModel.save(album2);

    // create a few photos
    let photo = new Photo();
    photo.name = "Me and Bears";
    photo.description = "I am near polar bears";
    photo.filename = "photo-with-bears.jpg";
    photo.albums = [album1, album2];
    await this.photoModel.save(photo);


    // now our photo is saved and albums are attached to it
    // now lets load them:
    const loadedPhoto = await this.photoModel.findOne(1, { relations: ["albums"] }); // typeorm@0.2.x
  }
}
```

The `loadedPhoto` value is:

```json
{
  id: 1
  name: "Me and Bears ",
  description: "I am near polar bears ",
  filename: "photo-with-bears.jpg ",
  albums: [{
    id: 1
    name: "Bears"
  }, {
    id: 2
    name: "Me"
  }]
}
```

### 18. Use QueryBuilder


You can use QueryBuilder to build almost any complex SQL query. For example, you can do this:


```typescript
let photos = await this.photoModel
    .createQueryBuilder("photo") // first argument is an alias. Alias is what you are selecting - photos. You must specify it.
    .innerJoinAndSelect("photo.metadata", "metadata")
    .leftJoinAndSelect("photo.albums", "album")
    .where("photo.isPublished = true")
    .andWhere("(photo.name = :photoName OR photo.name = :bearName)")
    .orderBy("photo.id", "DESC")
    .skip(5)
    .take(10)
    .setParameters({ photoName: "My", bearName: "Mishka" })
    .getMany();
```

The query selects all published photos with "My" or "Mishka" names. It will return results (paging offset) from position 5, and only 10 results (paging limit) will be selected. The selection results will be sorted in descending order of ID. The photo album will be left-Joined and metadata will be automatically associated.


You will use query generators extensively in your application. Learn more about QueryBuilder [here](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/select-query-builder.md).


### 19. Event Subscriber


typeorm provides an event subscription mechanism to facilitate log output when doing some database operations. For this reason, midway provides a `EventSubscriberModel` decorator to label event subscription classes with the following code.


```typescript
import { Provide } from '@midwayjs/decorator';
import { EventSubscriberModel } from '@midwayjs/orm';
import { EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';

@Provide()
@EventSubscriberModel()
export class EverythingSubscriber implements EntitySubscriberInterface {

  /**
   * Called before entity insertion.
   */
  beforeInsert(event: InsertEvent<any>) {
    console.log('BEFORE ENTITY INSERTED:', event.entity);
  }

  /**
   * Called before entity insertion.
   */
  beforeUpdate(event: UpdateEvent<any>) {
    console.log('BEFORE ENTITY UPDATED:', event.entity);
  }

  /**
   * Called before entity insertion.
   */
  beforeRemove(event: RemoveEvent<any>) {
    console.log('BEFORE ENTITY WITH ID ${event.entityId} REMOVED:', event.entity);
  }

  /**
   * Called after entity insertion.
   */
  afterInsert(event: InsertEvent<any>) {
    console.log('AFTER ENTITY INSERTED:', event.entity);
  }

  /**
	 * Called after entity insertion.
	 */
  afterUpdate(event: UpdateEvent<any>) {
    console.log('AFTER ENTITY UPDATED:', event.entity);
  }

  /**
   * Called after entity insertion.
   */
  afterRemove(event: RemoveEvent<any>) {
    console.log('AFTER ENTITY WITH ID ${event.entityId} REMOVED:', event.entity);
  }

  /**
   * Called after entity is loaded.
   */
  afterLoad(entity: any) {
    console.log('AFTER ENTITY LOADED:', entity);
  }

}
```


This subscription class provides some common interfaces to perform some things during database operations.

### 20. OrmConnectionHook

In versions prior to 3.4.0 (not included), the Midway package provided a Hook mechanism for monitoring database connection and disconnection events; the code is as follows.

```typescript
import { Provide } from '@midwayjs/decorator';
import { OrmConnectionHook, OrmHook } from '@midwayjs/orm';
import { Connection, ConnectionOptions } from 'typeorm';

@Provide()
@OrmHook()
export class OrmConnectionListener implements OrmConnectionHook {
  /**
   * Called before connection create
   * @param opts
   * @returns
   */
  async beforeCreate(opts?: ConnectionOptions): Promise<ConnectionOptions> {
    console.log('BEFORE CONNECTION CREATE');
    return opts;
  }

  /**
   * Called after connection create
   * @param conn
   * @param opts
   * @returns
   */
  async afterCreate(conn?: Connection, opts?: ConnectionOptions): Promise<Connection> {
    console.log('AFTER CONNECTION CREATE');
    return conn;
  }

  /**
   * Called before connection close
   * @param conn
   * @param connectionName
   * @returns
   */
  async beforeClose(conn?: Connection, connectionName?: string): Promise<Connection> {
    console.log('BEFORE CONNECTION CLOSE');
    return conn;
  }

  /**
   * Called after connection close
   * @param conn
   * @returns
   */
  async afterClose(conn?: Connection): Promise<Connection> {
    console.log('AFTER CONNECTION CLOSE');
    return conn;
  }
}
```




## Advanced features

### Multi-database support


Sometimes, we have multiple database connections (Connection) in an application, and there will be multiple configurations at this time. We use the **object form** to define the configuration.


For example, the following defines two database connections (Connection), `default` and `test`.


```typescript
import {join} from 'path';

export default {
  orm: {
    default: {
      type: 'sqlite',
      database: join(__dirname, '../../default.sqlite')
      logging: true
    },
    test: {
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306
      username: '*********',
      password: '*********',
      database: undefined
      synchronize: true
      logging: false
    }
  }
}
```


In use, you need to specify which connection (Connection) the model belongs.

```typescript
// entity/photo.ts
import { InjectEntityModel } from '@midwayjs/orm';
import { User } from './model/user';

export class XXX {

  @InjectEntityModel(User, 'test')
  testUserModel: Repository<User>;

  //...
}
```


Similarly, when using the injection Model, you need to specify the connection.


```typescript
// entity/photo.ts
import { EntityModel } from '@midwayjs/orm';

@EntityModel('photo', {
	connectionName: 'test'
})
export class Photo {
  id: number;
  name: string;
  description: string;
  filename: string;
  views: number;
  isPublished: boolean;
}
```




### Get connection pool

```typescript
import { Configuration } from '@midwayjs/decorator';
import { getConnection } from 'typeorm';

@Configuration()
export class AutoConfiguration {
  async onReady() {
  	const conn = getConnection('default');
    console.log(conn.isConnected);
  }
}
```


### Hooks scenario support


For the scenario of functional programming, we provide a simplified functional writing.


```typescript
import { useEntityModel } from '@midwayjs/orm';
import { Photo } from './entity/photo';

export async function getPhoto() {
  // get model
  const photoModel = useEntityModel(Photo);

  const photo = new Photo();
  // create entity
  photo.name = "Me and Bears";
  photo.description = "I am near polar bears";
  photo.filename = "photo-with-bears.jpg";
  photo.views = 1;
  photo.isPublished = true;

  // find
  const newPhoto = await photoModel.save(photo);

  return 'hello world';
}
```


### About Table Structure Synchronization


- If you already have a table structure, you want to automatically create an Entity and use the [Generator](../tool/typeorm_generator)
- If you already have Entity code, use the `synchronize: true` in the configuration to create a table structure.

## Frequently Asked Questions


### Handshake inactivity timeout


Generally, it is due to network reasons. If it appears locally, you can ping but telnet is not available. You can try to execute the following command:

```bash
$sudo sysctl -w net.inet.tcp.sack=0
```

### About the current time zone display of mysql time column


If you use the `@UpdateDateColumn` and `@CreateDateColumn` columns, UTC time is normally saved in the database. If you want to return the time in the current time zone, you can use the following method.


When configuring, turn on the time-to-string option.

```typescript
// src/config/config.default.ts
export default {
  // ...
  orm: {
    //...
    dateStrings: true
  },
}
```


The time column in the entity requires a column type.

```typescript
@EntityModel()
export class Photo {
  //...
  @UpdateDateColumn({
    name: "gmt_modified ",
    type: 'timestamp'
  })
  gmtModified: Date;

  @CreateDateColumn({
    name: "gmt_create ",
    type: 'timestamp'
  })
  gmtCreate: Date;
}
```

In this way, the output time field is the current time zone.


The effect is as follows:


**Before configuring:**

```typescript
gmtModified: 2021-12-13T03:49:43.000Z
gmtCreate: 2021-12-13T03:49:43.000Z
```

**After configuration:**

```typescript
gmtModified: '2021-12-13 11:49:43',
gmtCreate: '2021-12-13 11:49:43'
```




### Default values for time columns


If the `@UpdateDateColumn` and `@CreateDateColumn` columns are used, note that the default value is typeorm automatically added to the table-building statement. if the table is self-built, the field will be written to 00:00:00 because there is no default value.


There are two solutions: **1. Modify the default value of a table** or **2. Modify the default value of a column in the code**

**If you don't want to modify the table, but want to modify the code, please refer to the code below. **

```typescript
@Column({
  default: () => "NOW() ",
  type: 'timestamp'
})
createdOn: Date;

@Column({
  default: () => "NOW() ",
  type: 'timestamp'
})
modifiedOn: Date;
```



### Install mysql and mysql2 at the same time

when both mysql and mysql2 are present in the node_modules, the typeorm automatically loads mysql instead of mysql2.

If you need to use mysql2 at this time, please specify driver.

```typescript
// src/config/config.default.ts
export default {
  // ...
  orm: {
    //...
    type: 'mysql',
    driver: require('mysql2')
  },
}
```

