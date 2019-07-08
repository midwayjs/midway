import {Context} from 'egg';

export type KoaMiddleware = (context: Context, next: () => Promise<any>) => void;
