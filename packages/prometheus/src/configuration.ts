import {
  App,
  Config,
  Configuration,
  getClassMetadata,
  listModule,
} from '@midwayjs/decorator';
import { join } from 'path';
import * as PromClient from 'prom-client';
import { isMaster } from './utils/utils';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as qs from 'querystring';
import { DataService } from './service/dataService';
@Configuration({
  namespace: 'prometheus',
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  @Config('prometheus')
  prometheusConfig: any;

  @App()
  app;

  http_server: any;

  async onReady(contanier) {
    PromClient.collectDefaultMetrics(this.prometheusConfig);
    const modules = listModule('prometheus:master');
    const handlers = {};
    const sockFile = path.join(os.tmpdir(), 'midway-master.sock');
    if (modules.length > 0) {
      if (isMaster()) {
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
      const rules = getClassMetadata('prometheus:master:options', module);
      for (const rule of rules) {
        if (isMaster()) {
          handlers[rule.name] = async (...args) => {
            const service = await this.app
              .createAnonymousContext()
              .requestContext.getAsync(module);
            return rule.value.call(service, ...args);
          };
        }
      }
    }
    this.app.use(async (ctx, next) => {
      const service = await ctx.requestContext.getAsync(DataService);
      const startAt = process.hrtime();
      try {
        if (ctx.path === '/metrics') {
          const result = await service.getData();
          const Register = PromClient.register;
          ctx.set('Content-Type', Register.contentType);
          ctx.body = result;
        } else {
          await next();
        }
        var diff = process.hrtime(startAt);
        var time = diff[0] * 1e3 + diff[1] * 1e-6;
        service.getUser(ctx.method, '200', ctx.path, time);
      } catch (e) {
        var diff = process.hrtime(startAt);
        var time = diff[0] * 1e3 + diff[1] * 1e-6;
        service.getUser(ctx.method, '500', ctx.path, time);
        throw e;
      }
    });
  }

  async onStop() {
    if (isMaster()) {
      this.http_server.close();
    }
  }
}
