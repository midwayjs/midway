export type InfoValueType = 'html' | 'json';

export interface TypeInfo {
  type: string;
  info: {
    [key: string]: string | number;
  }
}

export interface InfoConfigOptions {
  title: string;
  infoPath: string;
  defaultHiddenKey: Array<string>;
}
