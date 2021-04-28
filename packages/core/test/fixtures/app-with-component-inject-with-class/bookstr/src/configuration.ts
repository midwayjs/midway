import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: 'bookstr'
})
export class BookConfigurationStr {
  onStop(container: any) {
    (global as any).container_not_null = typeof container.getAsync === 'function';
  }
}
