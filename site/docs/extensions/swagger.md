# Swagger
基于最新的 [OpenAPI 3.0.3](https://swagger.io/specification/) 实现了新版的 Swagger 组件。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ❌    |



## 安装依赖

```bash
$ npm install @midwayjs/swagger@3 --save
$ npm install swagger-ui-dist --save-dev
```

如果想要在服务器上输出 Swagger API 页面，则需要将 swagger-ui-dist 安装到依赖中。

```bash
$ npm install swagger-ui-dist --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/swagger": "^3.0.0",
    // 如果你希望在服务器上使用
    "swagger-ui-dist": "^4.2.1",
    // ...
  },
  "devDependencies": {
    // 如果你不希望在服务器上使用
    "swagger-ui-dist": "^4.2.1",
    // ...
  }
}
```



## 开启组件

在 ```configuration.ts``` 中增加组件。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as swagger from '@midwayjs/swagger';

@Configuration({
  imports: [
    // ...
    swagger
  ]
})
export class ContainerConfiguration {

}
```

可以配置启用的环境，比如下面的代码指的是“只在 local 环境下启用”。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as swagger from '@midwayjs/swagger';

@Configuration({
  imports: [
    // ...
    {
      component: swagger,
      enabledEnvironment: ['local']
    }
  ]
})
export class ContainerConfiguration {

}
```

然后启动项目，访问：http://127.0.0.1:7001/swagger-ui/index.html



## 基本使用

### 类型和参数

Swagger 组件会识别各个 ```@Controller``` 中每个路由方法的 ```@Body()```、```@Query()```、```@Param()``` 装饰器，提取路由方法参数和类型。

假设有一个方法：

```typescript
@Post('/:id', { summary: 'test'})
async create(@Body() createCatDto: CreateCatDto, @Param('id') id: number): Promise<Cat> {
  return this.catsService.create(createCatDto);
}
```

组件启动时会提取其中的两个参数：

![swagger1](https://img.alicdn.com/imgextra/i1/O1CN012WJPrd22H6QQZuXqJ_!!6000000007094-0-tps-1672-796.jpg)

图中可以看到 id，以及 request body 参数 Schema 为 CreateCatDto。其中 CreateCatDto 字段都是空的，我们提供了 ```@ApiProperty(...)``` 装饰器可以用来声明模型定义。

```typescript
import { ApiProperty } from "@midwayjs/swagger";

export class CreateCatDto {
  @ApiProperty({ example: 'Kitty', description: 'The name of the Catname'})
  name: string;

  @ApiProperty({ example: '1', description: 'The name of the Catage'})
  age: number;

  @ApiProperty({ example: 'bbbb', description: 'The name of the Catbreed'})
  breed: string;
}
```

Swagger UI 中展示：
![swagger2](https://img.alicdn.com/imgextra/i3/O1CN013UI5Ha1JSrt84NApB_!!6000000001028-0-tps-1672-486.jpg)

从代码中可以看到，我们对每个字段添加了 example、description，至于字段类型可以通过 ```design:type``` 来提取，当然也支持 ```@ApiProperty(...)``` 中通过 type 和 format 来定义。

```typescript
@ApiProperty({
  type: 'integer',
  format: 'int32',
  example: '1',
  description: 'The name of the Catage'
})
age: number;
```

如果是数组类型，由于 ```design:type``` 不支持范型类型，我们可以配置 type 字段来定义。

```typescript
@ApiProperty({
  type: [String],
  example: ['1'],
  description: 'The name of the Catage'
})
breeds: string[];
```

如果是枚举类型，可以通过配置 enmu 字段来定义。

```typescript
enum HelloWorld {
  One = 'One',
  Two = 'Two',
  Three = 'Three',
}

@ApiProperty({
  enum: ['One', 'Two', 'Three'],
  description: 'The name of the Catage'
})
hello: HelloWorld;
```

Swagger UI 中展示：
![swagger3](https://img.alicdn.com/imgextra/i1/O1CN015M37MU1KgtdNfqsgp_!!6000000001194-0-tps-1406-426.jpg)


### 路由定义
[OpenAPI](https://swagger.io/specification/) 定义的 paths 就是各个路由路径，且每个路由路径都有 HTTP 方法的定义，比如 GET、POST、DELETE、PUT 等。

#### Query 定义

使用 `@ApiQuery` 来定义 Query 数据。

基础使用，会自动识别 `@Query` 装饰器。

```typescript
@Get('/get_user')
async getUser(@Query('name') name: string) {
  return 'hello';
}
```

如果 `@Query`  以对象形式，需要在 `@ApiQuery` 指定一个 name 参数，对象类型需要配合 `@ApiProperty` 使用，否则表单会变为只读形式。

```typescript
export class UserDTO {
  @ApiProperty()
  name: string;
}

@Get('/get_user')
@ApiQuery({
  name: 'query'
})
async getUser(@Query() dto: UserDTO) {
  // ...
}
```



#### Body 定义

使用 `@ApiBody` 来定义 Body 数据。

 `@Body`  对象类型需要配合 `@ApiProperty` 使用。

```typescript
export class UserDTO {
  @ApiProperty()
  name: string;
}

@Post('/update_user')
async upateUser(@Body() dto: UserDTO) {
  // ...
}
```

如需其他细节，请使用 `@ApiBody` 增强。



### 路由标签
Swagger 会对 paths 分标签，如果 Controller 未定义任何标签，则会默认归组到 default 下。可以通过 ```@ApiTags([...])``` 来自定义 Controller 标签。

```typescript
@ApiTags(['hello'])
@Controller('/hello')
export class HelloController {}
```

### 请求 Header

通过 ```@ApiHeader({...})``` 装饰器来定义 Header 参数。

```typescript
@ApiHeader({
  name: 'x-test-one',
  description: 'this is test one'
})
@ApiTags(['hello'])
@Controller('/hello')
export class HelloController {}
```

### 请求 Response

可以使用 ```@ApiResponse({...})``` 来自定义请求 Response。

```typescript
@Get('/:id')
@ApiResponse({
  status: 200,
  description: 'The found record',
  type: Cat,
})
findOne(@Param('id') id: string, @Query('test') test: any): Cat {
  return this.catsService.findOne(+id);
}
```

还提供了其他不需要设置 status 的装饰器：
* ```@ApiOkResponse()```
* ```@ApiCreatedResponse()```
* ```@ApiAcceptedResponse()```
* ```@ApiNoContentResponse()```
* ```@ApiMovedPermanentlyResponse()```
* ```@ApiBadRequestResponse()```
* ```@ApiUnauthorizedResponse()```
* ```@ApiNotFoundResponse()```
* ```@ApiForbiddenResponse()```
* ```@ApiMethodNotAllowedResponse()```
* ```@ApiNotAcceptableResponse()```
* ```@ApiRequestTimeoutResponse()```
* ```@ApiConflictResponse()```
* ```@ApiTooManyRequestsResponse()```
* ```@ApiGoneResponse()```
* ```@ApiPayloadTooLargeResponse()```
* ```@ApiUnsupportedMediaTypeResponse()```
* ```@ApiUnprocessableEntityResponse()```
* ```@ApiInternalServerErrorResponse()```
* ```@ApiNotImplementedResponse()```
* ```@ApiBadGatewayResponse()```
* ```@ApiServiceUnavailableResponse()```
* ```@ApiGatewayTimeoutResponse()```
* ```@ApiDefaultResponse()```

HTTP 请求返回的数据模型定义也可以通过指定 type，当然这个数据模型需要通过装饰器 ```@ApiProperty``` 来描述各个字段。

```typescript
import { ApiProperty } from '@midwayjs/swagger';

export class Cat {
  @ApiProperty({ example: 'Kitty', description: 'The name of the Cat'})
  name: string;

  @ApiProperty({ example: 1, description: 'The age of the Cat' })
  age: number;

  @ApiProperty({
    example: 'Maine Coon',
    description: 'The breed of the Cat',
  })
  breed: string;
}
```

Swagger 还支持带前缀 ```x-``` 的扩展字段，可以使用 ```@ApiExtension(x-..., {...})``` 装饰器。

```typescript
@ApiExtension('x-hello', { hello: 'world' })
```



### 文件上传

使用 ```@ApiBody``` 设置 ```contentType```

```typescript
@Post('/:id', { summary: 'test'})
@ApiBody({
  description: 'this is body',
  contentType: BodyContentType.Multipart
})
@ApiParam({ description: 'this is id' })
async create(@Body() createCatDto: CreateCatDto, @Param('id') id: number): Promise<Cat> {
  return this.catsService.create(createCatDto);
}
```

在 ```CreateCatDto``` 中使用 ``` @ApiProperty ``` 添加 ```format```

```typescript
@ApiProperty({
  type: 'string',
  format: 'binary',
  description: 'this is file test'
})
file: any;
```

Swagger UI 中展示：
![swagger4](https://img.alicdn.com/imgextra/i3/O1CN01KlDHNt24mMglN1fyH_!!6000000007433-0-tps-1598-434.jpg)

兼容 Upload 组件，添加 ```@ApiBody()``` 装饰器描述

```typescript
@Post('/test')
@ApiBody({ description: 'hello file' })
@ApiBody({ description: 'hello fields', type: Cat })
async upload(@File() f: any, @Fields() data: Cat) {
  return null;
}
```

Swagger UI 中展示：
![swagger5](https://img.alicdn.com/imgextra/i2/O1CN01icnwZE24OY5vdkkKx_!!6000000007381-0-tps-1272-1026.jpg)

不添加 ```@ApiBody()``` 装饰器描述

```typescript
@Post('/test1')
async upload1(@Files() f: any[], @Fields() data: Cat) {
  return null;
}
```

:::tip

如需要 swagger 展示了，请务必添加类型（装饰器对应的类型，以及 @ApiBody 中的 type），否则会报错。

:::

Swagger UI 中展示：
![swagger6](https://img.alicdn.com/imgextra/i3/O1CN01w9dZxe1YQJv3uOycZ_!!6000000003053-0-tps-1524-1118.jpg)



### 授权验证

组件可以通过添加授权验证配置来设置验证方式，我们支持配置 ```basic```、```bearer```、```cookie```、```oauth2```、```apikey```、```custom```。

#### basic

* 启用 basic 验证

```typescript
// src/config/config.default.ts
export default {
  // ...
  swagger: {
    auth: {
      authType: 'basic',
    },
  },
}
```

* 关联 Controller
```typescript
@ApiBasicAuth()
@Controller('/hello')
export class HelloController {}
```

#### bearer

* 启用 bearer 验证（bearerFormat 为 JWT）

```typescript
// src/config/config.default.ts
export default {
  // ...
  swagger: {
    auth: {
      authType: 'bearer',
    },
  },
}
```

* 关联 Controller

```typescript
@ApiBearerAuth()
@Controller('/hello')
export class HelloController {}
```

#### oauth2

* 启用 oauth2 验证

```typescript
// src/config/config.default.ts
export default {
  // ...
  swagger: {
    auth: {
      authType: 'oauth2',
      flows: {
        implicit: {
          authorizationUrl: 'http://example.org/api/oauth/dialog',
          scopes: {
            'write:pets': 'modify pets in your account',
            'read:pets': 'read your pets'
          }
        },
        authorizationCode: {
          authorizationUrl: 'https://example.com/api/oauth/dialog',
          tokenUrl: 'https://example.com/api/oauth/token',
          scopes: {
            'write:pets': 'modify pets in your account',
            'read:pets': 'read your pets'
          }
        },
      },
    },
  },
}
```

* 关联 Controller
```typescript
@ApiOAuth2()
@Controller('/hello')
export class HelloController {}
```

#### cookie
* 启用 cookie 验证

```typescript
// src/config/config.default.ts
export default {
  // ...
  swagger: {
    auth: {
      authType: 'cookie',
      securityName: 'testforcookie',
      cookieName: 'connect.sid',
    },
  },
}
```

* 关联 Controller

```typescript
@ApiCookieAuth('testforcookie')
@Controller('/hello')
export class HelloController {}
```

#### apikey

* 启用 cookie 验证

```typescript
// src/config/config.default.ts
export default {
  // ...
  swagger: {
    auth: {
      authType: 'apikey',
    	name: 'api_key'
    },
  },
}
```

* 关联 Controller

```typescript
@ApiSecurity('api_key')
@Controller('/hello')
export class HelloController {}
```

#### custom

* 自定义验证方式，需要自己设计参数配置

```typescript
// src/config/config.default.ts
export default {
  // ...
  swagger: {
    auth: {
      authType: 'custom',
      name: 'mycustom'
      // ...
    },
  },
}
```

* 关联 Controller

```typescript
@ApiSecurity('mycustom')
@Controller('/hello')
export class HelloController {}
```



## 参数配置

Swagger 组件提供了和 [OpenAPI](https://swagger.io/specification/) 一致的参数配置能力，可以通过自定义配置来实现。

配置项如下：

```typescript
/**
 * see https://swagger.io/specification/
 */
export interface SwaggerOptions {
  /**
   * 默认值: My Project
   * https://swagger.io/specification/#info-object title 字段
   */
  title?: string;
  /**
   * 默认值: This is a swagger-ui for midwayjs project
   * https://swagger.io/specification/#info-object description 字段
   */
  description?: string;
  /**
   * 默认值: 1.0.0
   * https://swagger.io/specification/#info-object version 字段
   */
  version?: string;
  /**
   * https://swagger.io/specification/#info-object contact 字段
   */
  contact?: ContactObject;
  /**
   * https://swagger.io/specification/#info-object license 字段
   */
  license?: LicenseObject;
  /**
   * https://swagger.io/specification/#info-object termsOfService 字段
   */
  termsOfService?: string;
  /**
   * https://swagger.io/specification/#openapi-object externalDocs 字段
   */
  externalDocs?: ExternalDocumentationObject;
  /**
   * https://swagger.io/specification/#openapi-object servers 字段
   */
  servers?: Array<ServerObject>;
  /**
   * https://swagger.io/specification/#openapi-object tags 字段
   */
  tags?: Array<TagObject>;
  /**
   * 可以参考 https://swagger.io/specification/#security-scheme-object
   */
  auth?: AuthOptions | AuthOptions[];
  /**
   * 默认值: /swagger-ui
   * 访问 swagger ui 的路径
   */
  swaggerPath?: string;
  /**
   * 对路由 tag 进行 ascii 排序
   * 可以使用 1-xxx、2-xxx、3-xxx 来定义 tag
   */
  tagSortable?: boolean;
}
/**
 * 继承自 https://swagger.io/specification/#security-scheme-object
 */
export interface AuthOptions extends Omit<SecuritySchemeObject, 'type'> {
  /**
   * 验权类型
   * basic  => http basic 验证
   * bearer => http jwt 验证
   * cookie => cookie 方式验证
   * oauth2 => 使用 oauth2
   * apikey => apiKey
   * custom => 自定义方式
   */
  authType: AuthType;
  /**
   * https://swagger.io/specification/#security-scheme-object type 字段
   */
  type?: SecuritySchemeType;
  /**
   * authType = cookie 时可以修改，通过 ApiCookie 装饰器关联的名称
   */
  securityName?: string;
  /**
   * authType = cookie 时可以修改，cookie 的名称
   */
  cookieName?: string;
}
```



## 装饰器列表

组件所有装饰器参考了 [@nestjs/swagger](https://github.com/nestjs/swagger) 的设计，都带 ```Api``` 前缀。这里列出全部装饰器：

| 装饰器                      | 支持模式          |
| --------------------------- | ----------------- |
| ```@ApiBody```              | Method            |
| ```@ApiExcludeEndpoint```   | Method            |
| ```@ApiExcludeController``` | Controller        |
| ```@ApiHeader```            | Controller/Method |
| ```@ApiHeaders```           | Controller/Method |
| ```@ApiOperation```         | Method            |
| ```@ApiProperty```          | Model Property    |
| ```@ApiPropertyOptional```  | Model Property    |
| ```@ApiResponseProperty```  | Model Property    |
| ```@ApiQuery```             | Method            |
| ```@ApiResponse```          | Method            |
| ```@ApiTags```              | Controller/Method |
| ```@ApiExtension```         | Method            |
| ```@ApiBasicAuth```         | Controller        |
| ```@ApiBearerAuth```        | Controller        |
| ```@ApiCookieAuth```        | Controller        |
| ```@ApiOAuth2```            | Controller        |
| ```@ApiSecurity```          | Controller        |
| ```@ApiParam```             | Method            |
| ```@ApiParam```             | Method            |

