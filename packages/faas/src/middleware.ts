import { IMiddleware, MidwayContainer } from '.';

type FnMiddleware<T> = (context: T, next: () => Promise<any>) => any;
type ClassMiddleware<T> = IMiddleware<T>;

export type Middleware<T> = FnMiddleware<T> | ClassMiddleware<T> | string;

export async function loadMiddleware<T>(
  ctx: MidwayContainer,
  middlewares: Middleware<T>[]
) {
  const newMiddlewares: FnMiddleware<T>[] = [];
  for (const middleware of middlewares) {
    if (typeof middleware === 'function') {
      newMiddlewares.push(middleware);
      continue;
    }

    const middlewareImpl: IMiddleware<T> = await ctx.getAsync(middleware);

    if (middlewareImpl && typeof middlewareImpl.resolve === 'function') {
      newMiddlewares.push(middlewareImpl.resolve());
    }
  }

  return newMiddlewares;
}
