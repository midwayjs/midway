# Database（TypeORM)

[TypeORM](https://github.com/typeorm/typeorm) 是 `node.js` 现有社区最成熟的对象关系映射器（`ORM` ）。Midway 和 TypeORM 搭配，使开发更简单。


## 安装组件


安装 orm 组件，提供数据库 ORM 能力。


```bash
npm i @midwayjs/orm@3 typeorm --save
```


## 引入组件


在 `src/configuration.ts` 引入 orm 组件，示例如下。

```typescript
// configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as orm from '@midwayjs/orm';
import { join } from 'path';

@Configuration({
  imports: [
    orm  														// 加载 orm 组件
  ],
  importConfigs: [
  	join(__dirname, './config')	
  ]
})
export class ContainerConfiguratin {

}
```


## 安装数据库 Driver


常用数据库驱动如下，选择你对应连接的数据库类型安装：
```bash
# for MySQL or MariaDB，也可以使用 mysql2 替代
npm install mysql --save
npm install mysql2 --save

# for PostgreSQL or CockroachDB
npm install pg --save

# for SQLite
npm install sqlite3 --save

# for Microsoft SQL Server
npm install mssql --save

# for sql.js
npm install sql.js --save

# for Oracle
npm install oracledb --save

# for MongoDB(experimental)
npm install mongodb --save
```


:::info
To make the** Oracle driver work**, you need to follow the installation instructions from [their](https://github.com/oracle/node-oracledb) site.
:::


## 简单的目录结构


我们以一个简单的项目举例，其他结构请自行参考。


```
MyProject
├── src              							// TS 根目录
│   ├── config
│   │   └── config.default.ts 		// 应用配置文件
│   ├── entity       							// 实体（数据库 Model) 目录
│   │   └── photo.ts  					  // 实体文件
│   │   └── photoMetadata.ts
│   ├── configuration.ts     			// Midway 配置文件
│   └── service      							// 其他的服务目录
├── .gitignore
├── package.json  
├── README.md 
└── tsconfig.json 
```




在这里，我们的数据库实体主要放在 `entity` 目录（非强制），这只是一个简单的约定。


## 入门


下面，我们将以 mysql 举例。


### 1、创建 Model


我们通过模型和数据库关联，在应用中的模型就是数据库表，在 TypeORM 中，模型是和实体绑定的，每一个实体（Entity) 文件，即是 Model，也是实体（Entity）。


在示例中，需要一个实体，我们这里拿 `photo` 举例。新建 entity 目录，在其中添加实体文件 `photo.ts` ，一个简单的实体如下。
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
要注意，这里的实体文件的每一个属性，其实是和数据库表一一对应的，基于现有的数据库表，我们往上添加内容。


### 2、添加实体模型装饰器


我们使用 `EntityModel` 来定义一个实体模型类。
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
:::warning
注意，这里的 EntityModel 是 midway 做了封装的特殊装饰器，为了和 midway 更好的结合使用。请不要直接使用 typeorm 中的 Entity。
:::


如果表名和当前的实体名不同，可以在参数中指定。
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


这些实体列也可以使用 [typeorm_generator](typeorm_generator) 工具生成。


### 3、添加数据库列


通过 typeorm 提供的 `@Column` 装饰器来修饰属性，每一个属性对应一个列。


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

现在 `id` ， `name` ， `description` ，`filename` ， `views` ， `isPublished` 列将添加到 `photo`  表中。数据库中的列类型是根据您使用的属性类型推断出来的，例如 number 将转换为整数，将字符串转换为 varchar，将布尔值转换为 bool，等等。但是您可以通过在 `@Column`装饰器中显式指定列类型来使用数据库支持的任何列类型。


我们生成了带有列的数据库表，但是还剩下一件事。每个数据库表必须具有带主键的列。


数据库列包括更多的列选项（ColumnOptions），比如修改列名，指定列类型，列长度等，更多的选项请参考 [官方文档](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/entities.md#%E5%88%97%E9%80%89%E9%A1%B9)。




### 4、创建主键列


每个实体必须至少具有一个主键列。要使列成为主键，您需要使用 `@PrimaryColumn`  装饰器。


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
### 5、创建自增主键列


现在，如果要设置自增的 id 列，需要将 `@PrimaryColumn` 装饰器更改为 `@PrimaryGeneratedColumn`  装饰器：
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


### 6、列数据类型


接下来，让我们调整数据类型。默认情况下，字符串映射到类似 `varchar（255）` 的类型（取决于数据库类型）。 Number 映射为类似整数的类型（取决于数据库类型）。但是我们不希望所有列都限制为 varchars 或整数，这个时候可以做一些修改。


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


示例，不同列名
```typescript
@Column({
  length: 100,
  name: 'custom_name'
})
name: string;
```


此外还有有几种特殊的列类型可以使用：


- `@CreateDateColumn` 是一个特殊列，自动为实体插入日期。
- `@UpdateDateColumn` 是一个特殊列，在每次调用实体管理器或存储库的save时，自动更新实体日期。
- `@VersionColumn` 是一个特殊列，在每次调用实体管理器或存储库的save时自动增长实体版本（增量编号）。
- `@DeleteDateColumn` 是一个特殊列，会在调用 soft-delete（软删除）时自动设置实体的删除时间。



列类型是特定于数据库的。您可以设置数据库支持的任何列类型。有关支持的列类型的更多信息，请参见[此处](https://github.com/typeorm/typeorm/blob/master/docs/entities.md#column-types)。


### 7、配置连接信息


请参考 [配置](env_config) 章节，增加配置文件。


然后在 `config.default.ts`  中配置数据库连接信息。
```typescript
/**
 * 单数据库实例
 */
export const orm = {
  type: 'mysql',
  host: '',
  port: 3306,
  username: '',
  password: '',
  database: undefined,
  synchronize: false,		// 如果第一次使用，不存在表，有同步的需求可以写 true
  logging: false,
};
```
默认存储的是 utc 时间（推荐）。


也可以配置时区（不建议）
```typescript
export const orm = {
  // ...
  timezone: '+08:00',
};
```


这个 `type` 字段你可以使用其他的数据库类型，包括`mysql`, `mariadb`, `postgres`, `cockroachdb`, `sqlite`, `mssql`, `oracle`, `cordova`, `nativescript`, `react-native`, `expo`, or `mongodb`


 比如 sqlite，则只需要以下信息。


```typescript
export const orm = {
  type: 'sqlite',
  database: path.join(__dirname, '../../test.sqlite'),
  synchronize: true,
  logging: true,
};
```


:::info
注意：synchronize 字段用于同步表结构。使用 `synchronize: true` 进行生产模式同步是不安全的，在上线后，请把这个字段设置为 false。
:::


### 8、使用 Model 插入数据库数据


在常见的 Midway 文件中，使用 `@InjectEntityModel` 装饰器注入我们配置好的 Model。我们所需要做的只是：


- 1、创建实体对象
- 2、执行 save()

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
    console.log('photo id = ', photoResult.id);
  }
}
```


### 9、查询数据


更多的查询参数，请查询 [find文档](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/find-options.md)。
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
  async findPhotos() {
    
    // find All
    let allPhotos = await this.photoModel.find();
    console.log("All photos from the db: ", allPhotos);

    // find first
    let firstPhoto = await this.photoModel.findOne(1);
    console.log("First photo from the db: ", firstPhoto);

    // find one by name
    let meAndBearsPhoto = await this.photoModel.findOne({ name: "Me and Bears" });
    console.log("Me and Bears photo from the db: ", meAndBearsPhoto);

    // find by views
    let allViewedPhotos = await this.photoModel.find({ views: 1 });
    console.log("All viewed photos: ", allViewedPhotos);

    let allPublishedPhotos = await this.photoModel.find({ isPublished: true });
    console.log("All published photos: ", allPublishedPhotos);

  	// find and get count
    let [allPhotos, photosCount] = await this.photoModel.findAndCount();
    console.log("All photos: ", allPhotos);
    console.log("Photos count: ", photosCount);
   
  }
}

```


### 10、更新数据库


现在，让我们从数据库中加载一个 Photo，对其进行更新并保存。


```typescript
import { Provide, Inject, Func } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from './entity/photo';
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


### 11、删除数据


```typescript
import { Provide, Inject, Func } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Photo } from './entity/photo';
import { Repository } from 'typeorm';

@Provide()
export class PhotoService {

  @InjectEntityModel(Photo)
	photoModel: Repository<Photo>;
  
  async updatePhoto() {
		/*...*/
    let photoToRemove = await this.photoModel.findOne(1);
    await this.photoModel.remove(photoToRemove);
  }
}
```
现在，ID = 1的 Photo 将从数据库中删除。


此外还有软删除的方法。
```typescript
await this.photoModel.softDelete(1);
```


### 12、创建一对一关联


让我们与另一个类创建一对一的关系。让我们在 `entity/photoMetadata.ts`  中创建一个新类。这个类包含 photo 的其他元信息。


```typescript
import { Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
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


在这里，我们使用一个名为 `@OneToOne`  的新装饰器。它允许我们在两个实体之间创建一对一的关系。`type => Photo`是一个函数，它返回我们要与其建立关系的实体的类。


由于语言的特殊性，我们被迫使用一个返回类的函数，而不是直接使用该类。我们也可以将其写为 `() => Photo`  ，但是我们使用 `type => Photo`作为惯例来提高代码的可读性。类型变量本身不包含任何内容。 


我们还添加了一个 `@JoinColumn`装饰器，它指示关系的这一侧将拥有该关系。关系可以是单向或双向的。关系只有一方可以拥有。关系的所有者端需要使用@JoinColumn装饰器。 如果您运行该应用程序，则会看到一个新生成的表，该表将包含一列，其中包含用于 Photo 关系的外键。


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


接下去我们要在代码中关联他们。


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


### 13、反向关系映射


关系映射可以是单向或双向的。当在 PhotoMetadata  和 Photo之间的关系是单向的。关系的所有者是PhotoMetadata，而 Photo对 PhotoMetadata 是一无所知的。这使得从 Photo 端访问 PhotoMetadata 变得很复杂。若要解决此问题，我们添加一个反向的关系映射，使  PhotoMetadata  和 Photo之间变成双向关联。让我们修改我们的实体。


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
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm";
import { PhotoMetadata } from './photoMetadata';

@EntityModel()
export class Photo {

  /* ... other columns */

  @OneToOne(type => PhotoMetadata, photoMetadata => photoMetadata.photo)
  metadata: PhotoMetadata;
}
```
`photo => photo.metadata` 是一个返回反向映射关系的函数。在这里，我们显式声明 Photo 类的 metadata 属性用于关联 PhotoMetadata。除了传递返回 photo 属性的函数外，您还可以直接将字符串传递给 `@OneToOne`  装饰器，例如 `“metadata”` 。但是我们使用了这种函数回调的方法来让我们的代码写法更简单。


请注意，只会在关系映射的一侧使用 `@JoinColumn`  装饰器。无论您放置此装饰器的哪一侧，都是关系的所有者。关系的拥有方在数据库中包含带有外键的列。


### 14、加载对象及其依赖关系


现在，让我们尝试在单个查询中一起加载出  Photo 和 PhotoMetadata。有两种方法可以执行此操作，使用  `find *`   方法或使用 `QueryBuilder` 功能。让我们首先使用 `find *` 方法。 `find *`  方法允许您使用 `FindOneOptions`  / `FindManyOptions`  接口指定对象。


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
    let photos = await this.photoModel.find({ relations: [ 'metadata' ] });
  }
}

```
在这里，photos  的值是一个数组，包含了整个数据库的查询结果，并且每个 photo 对象都包含其关联的 metadata 属性。在[此文档](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md)中了解有关 `Find Options` 的更多信息。


使用 `Find Options` 很简单，但如果需要更复杂的查询，则应改用 `QueryBuilder` 。 `QueryBuilder`   允许以优雅的方式使用更复杂的查询。


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
`QueryBuilder`允许创建和执行几乎任何复杂的 SQL 查询。使用 `QueryBuilder`  时，请像创建  SQL 查询一样思考。在此示例中，“photo”  和 “metadata” 是应用于所选 photos  的别名。您可以使用别名来访问所选数据的列和属性。


### 15、使用级联操作自动保存关联对象


在我们希望在每次保存另一个对象时都自动保存关联的对象，这个时候可以在关系中设置级联。让我们稍微更改照片的 `@OneToOne`  装饰器。


```typescript
export class Photo {
  /// ... other columns

  @OneToOne(type => PhotoMetadata, metadata => metadata.photo, {
    cascade: true,
  })
  metadata: PhotoMetadata;
}
```
使用 `cascade` 允许我们现在不再单独保存 Photo 和 PhotoMetadata，由于级联选项，元数据对象将被自动保存。


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

    photo.metadata = metadata;  // this way we connect them
    
    // save a photo also save the metadata
    await this.photoModel.save(photo);
    
    // done
    console.log("Photo is saved, photo metadata is saved too");
  }
}
```


注意，我们现在设置 Photo 的元数据，而不需要像之前那样设置元数据的 Photo 属性。这仅当您从 Photo 这边将 Photo 连接到 PhotoMetadata 时，级联功能才有效。如果在 PhotoMetadata 侧设置，则不会自动保存。


### 16、创建多对一/一对多关联


让我们创建一个多对一/一对多关系。假设一张照片有一个作者，每个作者可以有很多照片。首先，让我们创建一个 Author 类：
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
`Author`  包含了一个反向关系。 `OneToMany`  和 `ManyToOne` 需要成对出现。


现在，将关系的所有者添加到 Photo 实体中：
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


在多对一/一对多关系中，所有者方始终是多对一。这意味着使用 `@ManyToOne`  的类将存储相关对象的 ID。


运行应用程序后，ORM 将创建 `author` 表：


```
+-------------+--------------+----------------------------+
|                          author                         |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
+-------------+--------------+----------------------------+
```
它还将修改 `photo` 表，添加新的 `author`  列并为其创建外键：
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


### 17、创建多对多关联


让我们创建一个多对一/多对多关系。假设一张照片可以在许多相册中，并且每个相册可以包含许多照片。让我们创建一个 `Album` 类。


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


`@JoinTable` 用来指明这是关系的所有者。


现在，将反向关联添加到 `Photo` 。


```typescript
export class Photo {
  /// ... other columns

  @ManyToMany(type => Album, album => album.photos)
  albums: Album[];
}
```
运行应用程序后，ORM将创建一个 album_photos_photo_albums 联结表：


```
+-------------+--------------+----------------------------+
|                album_photos_photo_albums                |
+-------------+--------------+----------------------------+
| album_id    | int(11)      | PRIMARY KEY FOREIGN KEY    |
| photo_id    | int(11)      | PRIMARY KEY FOREIGN KEY    |
+-------------+--------------+----------------------------+
```


现在，让我们将相册和照片插入数据库：


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
    const loadedPhoto = await this.photoModel.findOne(1, { relations: ["albums"] });
  }
}
```
`loadedPhoto` 的值为：
```json
{
  id: 1,
  name: "Me and Bears",
  description: "I am near polar bears",
  filename: "photo-with-bears.jpg",
  albums: [{
    id: 1,
    name: "Bears"
  }, {
    id: 2,
    name: "Me"
  }]
}
```
### 
### 18、使用 QueryBuilder


您可以使用QueryBuilder来构建几乎任何复杂的SQL查询。例如，您可以这样做：


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
该查询选择所有带有 “My” 或 “Mishka” 名称的已发布照片。它将从位置 5 开始返回结果（分页偏移），并且将仅选择 10 个结果（分页限制）。选择结果将按 ID 降序排列。该照片的相册将 left-Joined，元数据将自动关联。 


您将在应用程序中大量使用查询生成器。在 [此处](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/select-query-builder.md) 了解有关QueryBuilder的更多信息。


### 19、Event Subscriber


typeorm 提供了一个事件订阅机制，方便在做一些数据库操作时的日志输出，为此 midway 提供了一个 `EventSubscriberModel` 装饰器，用来标注事件订阅类，代码如下。


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
			console.log(`BEFORE ENTITY INSERTED: `, event.entity);
	}

	/**
	 * Called before entity insertion.
	 */
	beforeUpdate(event: UpdateEvent<any>) {
			console.log(`BEFORE ENTITY UPDATED: `, event.entity);
	}

	/**
	 * Called before entity insertion.
	 */
	beforeRemove(event: RemoveEvent<any>) {
			console.log(`BEFORE ENTITY WITH ID ${event.entityId} REMOVED: `, event.entity);
	}

	/**
	 * Called after entity insertion.
	 */
	afterInsert(event: InsertEvent<any>) {
			console.log(`AFTER ENTITY INSERTED: `, event.entity);
	}

	/**
	 * Called after entity insertion.
	 */
	afterUpdate(event: UpdateEvent<any>) {
			console.log(`AFTER ENTITY UPDATED: `, event.entity);
	}

	/**
	 * Called after entity insertion.
	 */
	afterRemove(event: RemoveEvent<any>) {
			console.log(`AFTER ENTITY WITH ID ${event.entityId} REMOVED: `, event.entity);
	}

	/**
	 * Called after entity is loaded.
	 */
	afterLoad(entity: any) {
			console.log(`AFTER ENTITY LOADED: `, entity);
	}

}
```


这个订阅类提供了一些常用的接口，用来在数据库操作时执行一些事情。


## 高级功能
### 多数据库支持


有时候，我们一个应用中会有多个数据库连接（Connection）的情况，这个时候会有多个配置。我们使用**对象的形式**来定义配置。


比如下面定义了 `default` 和 `test` 两个数据库连接（Connection）。


```typescript
import {join} from 'path';

export default {
  orm: {
    default: {
      type: 'sqlite',
      database: join(__dirname, '../../default.sqlite'),
      logging: true,
    },
    test: {
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: '*********',
      password: '*********',
      database: undefined,
      synchronize: true,
      logging: false,
    }
  }
}
```


在使用时，需要指定模型归属于哪个连接（Connection）。
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


同样的，在使用注入 Model 时，需要指定连接。


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




### 获取连接池
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


### Hooks 场景支持


针对函数式编程的场景，我们提供了简化的函数式写法。


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


### 关于表结构同步


- 如果你已有表结构，想自动创建 Entity，使用 [生成器](typeorm_generator)
- 如果已经有 Entity 代码，想创建表结构请使用配置中的  `synchronize:  true` 。

## 常见问题


### Handshake inactivity timeout


一般是网络原因，如果本地出现，可以 ping 但是telnet不通，可以尝试执行如下命令：
```shell
sudo sysctl -w net.inet.tcp.sack=0
```
### 
### 关于 mysql 时间列的当前时区展示


如果使用 `@UpdateDateColumn` 和 `@CreateDateColumn` 列，一般情况下，数据库中保存的是 UTC 时间，如果你希望返回当前时区的时间，可以使用下面的方式。


在配置时，开启时间转字符串的选项。
```typescript
// src/config/config/default

config.orm = {
	//... 
  dateStrings: true,
};

```


实体中的时间列需要列类型。
```typescript
@EntityModel()
export class Photo {
  //...
  @UpdateDateColumn({
    name: "gmt_modified",
    type: 'timestamp'
  })
  gmtModified: Date;

  @CreateDateColumn({
    name: "gmt_create",
    type: 'timestamp'
  })
  gmtCreate: Date;
}
```
这样，输出的时间字段就是当前的时区了。


效果如下：


**配置前：**
```typescript
gmtModified: 2021-12-13T03:49:43.000Z,
gmtCreate: 2021-12-13T03:49:43.000Z
```
**配置后：**
```typescript
gmtModified: '2021-12-13 11:49:43',
gmtCreate: '2021-12-13 11:49:43'
```




### 关于时间列的默认值


如果使用 `@UpdateDateColumn` 和 `@CreateDateColumn` 列，那么注意，typeorm 是在建表语句中自动添加了默认值，如果表是用户自建的，该字段会由于没有默认值而写入 00:00:00 的时间。


解决方案有两个 **1、修改表的默认值**  或者 **2、修改代码中列的默认值**


**如果不想修改表，而想修改代码，请参考下面的代码。**
```typescript
@Column({
  default: () => "NOW()",
  type: 'timestamp'
})
createdOn: Date;

@Column({
  default: () => "NOW()",
  type: 'timestamp'
})
modifiedOn: Date;
```

