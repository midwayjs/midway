export interface WebMiddleware {
  resolve(): (ctx, next?) => void;
}
