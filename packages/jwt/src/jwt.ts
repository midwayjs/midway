import { Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import type {
  DecodeOptions,
  GetPublicKeyOrSecret,
  Jwt as JwtType,
  Secret,
  SignOptions,
  VerifyOptions,
} from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';

type JwtPayload = string | Buffer | Record<string, any>;

/**
 *
 * @see{@link https://github.com/auth0/node-jsonwebtoken}
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class JWTService {
  @Config('jwt')
  private jwtConfig: any;

  public signSync(
    payload: JwtPayload,
    options: SignOptions = {},
    secret?: Secret
  ): string | void {
    let expiresIn;
    if (!secret) {
      secret = this.jwtConfig?.secret;
    }
    if (!secret) {
      throw new Error('[midway-jwt]: jwt secret should be set');
    }

    if (options.expiresIn) {
      expiresIn = options.expiresIn;
    }

    if (this.jwtConfig.expiresIn) {
      expiresIn = this.jwtConfig.expiresIn;
    }

    options.expiresIn = expiresIn;

    return jwt.sign(payload, secret, options);
  }

  /**
   *
   * @async
   */
  public async sign(
    payload: JwtPayload,
    options: SignOptions = {},
    secret?: Secret
  ): Promise<string | void> {
    let expiresIn;
    if (!secret) {
      secret = this.jwtConfig?.secret;
    }

    if (!secret) {
      throw new Error('[midway-jwt]: provide the jwt secret please');
    }

    if (options.expiresIn) {
      expiresIn = options.expiresIn;
    }

    if (this.jwtConfig.expiresIn) {
      expiresIn = this.jwtConfig.expiresIn;
    }

    options.expiresIn = expiresIn;

    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, options, (err, encoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(encoded);
        }
      });
    });
  }

  public verifySync(
    token: string,
    options?: VerifyOptions & { complete: true },
    secret?: Secret
  ): JWTService | string | JwtPayload {
    if (!secret) {
      secret = this.jwtConfig?.secret;
    }

    if (!secret) {
      throw new Error('[midway-jwt]: provide the jwt secret please');
    }

    return jwt.verify(token, secret, options);
  }

  /**
   *
   * @async
   */
  public async verify(
    token: string,
    options?: VerifyOptions & { complete: true },
    secret?: Secret | GetPublicKeyOrSecret
  ): Promise<JwtType | undefined | JwtPayload> {
    if (!secret) {
      secret = this.jwtConfig?.secret;
    }

    if (!secret) {
      throw new Error('[midway-jwt]: provide the jwt secret please');
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, options, (err, encoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(encoded);
        }
      });
    });
  }

  public decodeSync(
    token: string,
    options?: DecodeOptions & { complete: true } & { json: true }
  ): JWTService | null | JwtPayload | string {
    return jwt.decode(token, options);
  }
}
