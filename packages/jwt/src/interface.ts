import { DecodeOptions, SignOptions, VerifyOptions } from 'jsonwebtoken';

export type JwtUserConfig = (SignOptions & {
  secret?: string;
}) | JwtConfig;

export type JwtConfig = {
  sign?: SignOptions;
  verify?: VerifyOptions;
  decode?: DecodeOptions;
  secret?: string;
}
