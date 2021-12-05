import { Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import type {
  DecodeOptions,
  GetPublicKeyOrSecret,
  Jwt,
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
export class JwtService {
  @Config('jwt')
  private jwtConfig: any;

  /**
   * Synchronously sign the given payload into a JSON Web Token string
   * payload - Payload to sign, could be an literal, buffer or string
   * secretOrPrivateKey - Either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.
   * [options] - Options for the signature
   * returns - The JSON Web Token string
   */
  public signSync(payload: JwtPayload, options?: SignOptions): string;
  public signSync(
    payload: JwtPayload,
    secretOrPrivateKey: Secret,
    options?: SignOptions
  ): string;
  public signSync(
    payload: JwtPayload,
    secretOrPrivateKey: any,
    options?: any
  ): string {
    if (!options) {
      options = secretOrPrivateKey;
      secretOrPrivateKey = this.jwtConfig?.secret;
    }
    if (!secretOrPrivateKey) {
      throw new Error('[midway-jwt]: jwt secret should be set');
    }
    options = options ?? {};
    options.expiresIn = options.expiresIn ?? this.jwtConfig.expiresIn;

    return jwt.sign(payload, secretOrPrivateKey, options);
  }

  /**
   * Asynchronous sign the given payload into a JSON Web Token string
   * payload - Payload to sign, could be an literal, buffer or string
   * secretOrPrivateKey - Either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.
   * [options] - Options for the signature
   * returns - The JSON Web Token string
   */
  public async sign(
    payload: JwtPayload,
    options?: SignOptions
  ): Promise<string>;
  public async sign(
    payload: JwtPayload,
    secretOrPrivateKey: Secret,
    options?: SignOptions
  ): Promise<string>;
  public async sign(
    payload: JwtPayload,
    secretOrPrivateKey: any,
    options?: any
  ): Promise<string> {
    if (!options) {
      options = secretOrPrivateKey;
      secretOrPrivateKey = this.jwtConfig?.secret;
    }
    if (!secretOrPrivateKey) {
      throw new Error('[midway-jwt]: provide the jwt secret please');
    }
    options = options ?? {};
    options.expiresIn = options.expiresIn ?? this.jwtConfig.expiresIn;

    return new Promise((resolve, reject) => {
      jwt.sign(payload, secretOrPrivateKey, options, (err, encoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(encoded);
        }
      });
    });
  }

  /**
   * Synchronously verify given token using a secret or a public key to get a decoded token
   * token - JWT string to verify
   * secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.
   * [options] - Options for the verification
   * returns - The decoded token.
   */
  public verifySync(
    token: string,
    options: VerifyOptions & { complete: true }
  ): Jwt | string;
  public verifySync(token: string, options: VerifyOptions): JwtPayload | string;
  public verifySync(
    token: string,
    secretOrPublicKey: Secret,
    options?: VerifyOptions & { complete: true }
  ): Jwt | string;
  public verifySync(
    token: string,
    secretOrPublicKey: Secret,
    options?: VerifyOptions
  ): JwtPayload | string;
  public verifySync(token: string, secretOrPublicKey: any, options?: any): any {
    if (!options) {
      options = secretOrPublicKey;
      secretOrPublicKey = this.jwtConfig?.secret;
    }

    if (!secretOrPublicKey) {
      throw new Error('[midway-jwt]: provide the jwt secret please');
    }

    return jwt.verify(token, secretOrPublicKey, options);
  }

  /**
   * Asynchronous verify given token using a secret or a public key to get a decoded token
   * token - JWT string to verify
   * secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.
   * [options] - Options for the verification
   * returns - The decoded token.
   */
  public async verify(
    token: string,
    options?: VerifyOptions & { complete: true }
  ): Promise<Jwt | string>;
  public async verify(
    token: string,
    options?: VerifyOptions
  ): Promise<JwtPayload | string>;
  public async verify(
    token: string,
    secretOrPublicKey: Secret | GetPublicKeyOrSecret,
    options?: VerifyOptions & { complete: true }
  ): Promise<Jwt | string>;
  public async verify(
    token: string,
    secretOrPublicKey: Secret | GetPublicKeyOrSecret,
    options?: VerifyOptions
  ): Promise<JwtPayload | string>;
  public async verify(
    token: string,
    secretOrPublicKey: any,
    options?: any
  ): Promise<any> {
    if (!options) {
      options = secretOrPublicKey;
      secretOrPublicKey = this.jwtConfig?.secret;
    }

    if (!secretOrPublicKey) {
      throw new Error('[midway-jwt]: provide the jwt secret please');
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, secretOrPublicKey, options, (err, encoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(encoded);
        }
      });
    });
  }

  /**
   * Returns the decoded payload without verifying if the signature is valid.
   * token - JWT string to decode
   * [options] - Options for decoding
   * returns - The decoded Token
   */
  public decode(
    token: string,
    options: DecodeOptions & { complete: true }
  ): null | Jwt;
  public decode(
    token: string,
    options: DecodeOptions & { json: true }
  ): null | JwtPayload;
  public decode(
    token: string,
    options?: DecodeOptions
  ): null | JwtPayload | string;
  public decode(token: string, options?: any): any {
    return jwt.decode(token, options);
  }

  /**
   * alias decode method
   * @param token
   * @param options
   */
  public decodeSync(
    token: string,
    options: DecodeOptions & { complete: true }
  ): null | Jwt;
  public decodeSync(
    token: string,
    options: DecodeOptions & { json: true }
  ): null | JwtPayload;
  public decodeSync(
    token: string,
    options?: DecodeOptions
  ): null | JwtPayload | string;
  public decodeSync(token: string, options?: any): any {
    return this.decode(token, options);
  }
}
