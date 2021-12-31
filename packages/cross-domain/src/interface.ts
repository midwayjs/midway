export interface CORSOptions {
  allowMethods: string |string[];
  origin: string|Function;
  exposeHeaders: string |string[];
  allowHeaders: string |string[];
  credentials: boolean|Function;
  keepHeadersOnError: boolean;
  maxAge: number;
}
export interface JSONPOptions {
  callback: string;
  limit: number;
}