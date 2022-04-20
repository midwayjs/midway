import * as OSS from 'ali-oss';
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);

export interface MWOSSOptions extends OSS.Options { }

export interface MWOSSClusterOptions extends OSS.ClusterOptions {
    clusters: (OSS.ClusterType & { endpoint: string })[];
    timeout?: string;
}

export interface MWOSSSTSOptions extends OSS.STSOptions {
    sts: boolean
}

export type OSSServiceFactoryReturnType = OSS | OSS.STS | OSS.ClusterClient

export type OSSServiceFactoryCreateClientConfigType = XOR<XOR<MWOSSOptions, MWOSSClusterOptions>, MWOSSSTSOptions>