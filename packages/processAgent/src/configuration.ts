import {
  App,
  Configuration,
  getClassMetadata,
  listModule,
} from '@midwayjs/decorator';
import { isPrimary, closeLock } from './utils/utils';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as qs from 'querystring';

@Configuration({
  namespace: 'process-agent',
})
export class AutoConfiguration {
  http_server: any;

  @App()
  app;

  async onReady() {
    const modules = listModule('primary:primary');
    const handlers = {};
    let sockFile = path.join(os.tmpdir(), 'midway-primary.sock');
    if (process.platform === 'win32') {
      sockFile =
        '\\\\.\\pipe\\' + sockFile.replace(/^\//, '').replace(/\//g, '-');
    }
    if (modules.length > 0 && process.platform !== 'win32') {
      if (isPrimary()) {
        if (fs.existsSync(sockFile)) {
          fs.unlinkSync(sockFile);
        }
        this.http_server = http
          .createServer((req, res) => {
            const query = qs.parse(req.url.substr('/?'.length));
            const params = JSON.parse(query.params as string);
            handlers[`${query.path}`](...params).then(result => {
              res.end(result);
            });
          })
          .listen(sockFile);
      }
    }
    for (const module of modules) {
      const rules = getClassMetadata('primary:primary:options', module);
      for (const rule of rules) {
        if (isPrimary()) {
          handlers[rule.name] = async (...args) => {
            const service = await this.app
              .createAnonymousContext()
              .requestContext.getAsync(module);
            return rule.value.call(service, ...args);
          };
        }
      }
    }
  }

  async onStop() {
    if (isPrimary()) {
      closeLock();
      this.http_server && this.http_server.close();
    }
  }
}
