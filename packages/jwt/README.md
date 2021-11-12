## 开始

安装 `npm i @midwayjs/jwt `

可配合 @midwayjs/passport 使用

config.{env}.ts

```ts
config.jwt = {
  secret: 'dev123456',
  expiresIn: '10d', // https://github.com/vercel/ms
};
```

```ts
import { JWTService } from '@midwayjs/jwt';

@Provide()
class Demo {
  @Inject()
  jwt: JWTService;
}
```

## API

**请不要在 payload 存放任何敏感信息**

- public async sign(payload: JwtPayload, options?: SignOptions, secret?: Secret): Promise<string | void>
- public signSync(payload: JwtPayload, options?: SignOptions, secret?: Secret): string | void

- verifySync(token: string,options?: VerifyOptions & { complete: true },secret?: Secret): Jwt | string | JwtPayload
- public async verify(token: string,options?: VerifyOptions & { complete: true },secret?: Secret | GetPublicKeyOrSecret): Promise<JwtType | undefined | JwtPayload>

- decodeSync(token: string,options?: DecodeOptions & { complete: true } & { json: true }): Jwt | null | JwtPayload | string
