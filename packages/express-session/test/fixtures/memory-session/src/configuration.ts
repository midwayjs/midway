import { Configuration, Controller, Get, Inject } from '@midwayjs/decorator';
import * as express from '../../../../../web-express';
import { SessionStoreManager } from '../../../../src';
import MemoryStore = require('memorystore');

@Configuration({
  imports: [
    express,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: '12345'
      }
    }
  ]
})
export class AutoConfiguration {

  @Inject()
  sessionStoreManager: SessionStoreManager;

  async onReady() {
    this.sessionStoreManager.setSessionStore(MemoryStore, {
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async onStop() {
    const store = this.sessionStoreManager.getSessionStore();
    store.stopInterval();
  }
}

@Controller('/')
export class HomeController {

  @Get('/get')
  async get(req) {
    // ctx.session.a = '1';
    return req.session;
  }
  @Get('/set')
  async set(req) {
    req.session.foo = req.query.foo;
    return req.session;
  }
  @Get('/setKey')
  async setKey(req) {
    req.session.key = req.query.key;
    return req.session;
  }
  @Get('/remove')
  async remove(req) {
    req.session = null;
    return req.session;
  }
  @Get('/maxAge')
  async maxAge(req) {
    req.session.maxAge = Number(req.query.maxAge);
    return req.session;
  }
}
