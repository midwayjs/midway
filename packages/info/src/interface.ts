export enum InfoValueType {
  HTML = 'html',
  JSON = 'json',
}

export interface TypeInfo {
  type: string;
  info: {
    [key: string]: string | number;
  }
}