export type KoaMiddleware <T = any> = (context: T, next: () => Promise<any>) => void;
export type KoaMiddlewareParamArray <T = any> = Array<string | KoaMiddleware<T>>;
