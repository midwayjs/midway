export default function(options: any, app: any): any {
  return async (ctx: any, next: any) => {
    const startTime: number = Date.now();
    await next();
    ctx.set('X-Execute-time', Date.now() - startTime);
  };
}
