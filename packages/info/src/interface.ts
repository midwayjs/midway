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
}
