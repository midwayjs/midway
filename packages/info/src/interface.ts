export type InfoValueType = 'html' | 'json';

export const DefaultHiddenKey = ['keys', '*key', '*token', '*secret*', 'pass*'];

export interface TypeInfo {
  type: string;
  info: {
    [key: string]: string | number;
  }
}

export interface InfoConfigOptions {
  title: string;
  infoPath: string;
  hiddenKey: Array<string>;
  ignoreKey: Array<string>
}


export enum InfoType{
  PROJECT='Project',
  SYSTEM='System',
  MEMORY_CPU='Memory & CPU',
  SOFTWARE='Software',
  ENVIRONMENT_VARIABLE='Environment Variable',
  TIME='Time',
  NETWORK='Network',
  RESOURCE='Resource',
  DEPENDENCIES='Dependencies',
  MIDWAY_SERVICE='Midway Service',
  MIDWAY_CONFIG='Midway Config',
}
