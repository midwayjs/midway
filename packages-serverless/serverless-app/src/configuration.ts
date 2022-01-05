import { Configuration } from '@midwayjs/decorator';
import * as faas from '@midwayjs/faas';

@Configuration({
  namespace: 'serverless-app',
  imports: [faas],
})
export class ServerlessAppConfiguration {}
