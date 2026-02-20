export interface CORSOptions {
  allowMethods: string | string[];
  origin: string | ((...args: any[]) => any);
  exposeHeaders: string | string[];
  allowHeaders: string | string[];
  credentials: boolean | ((...args: any[]) => any);
  keepHeadersOnError: boolean;
  maxAge: number;
}
export interface JSONPOptions {
  callback: string;
  limit: number;
  csrf: boolean;
}
