import { Scope, Provide, Configuration, Controller, Get, ScopeEnum, Inject } from '@midwayjs/decorator';
import * as koa from '../../../../../web-koa';
import { SessionStore, SessionStoreManager } from '../../../../src';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MemorySessionStore extends SessionStore {
  sessions = {};
  async get(key) {
    return this.sessions[key];
  }

  async set(key, value) {
    this.sessions[key] = value;
  }

  async destroy(key) {
    this.sessions[key] = undefined;
  }
}

@Configuration({
  imports: [
    koa,
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
  memoryStore: MemorySessionStore;

  @Inject()
  sessionStoreManager: SessionStoreManager;

  async onReady() {
    this.sessionStoreManager.setSessionStore(this.memoryStore);
  }
}

@Controller('/')
export class HomeController {

  @Get('/get')
  async get(ctx) {
    return ctx.session;
  }
  @Get('/set')
  async set(ctx) {
    ctx.session = ctx.query;
    ctx.body = ctx.session;
  }
  @Get('/setKey')
  async setKey(ctx) {
    ctx.session.key = ctx.query.key;
    ctx.body = ctx.session;
  }
  @Get('/remove')
  async remove(ctx) {
    ctx.session = null;
    ctx.body = ctx.session;
  }
  @Get('/maxAge')
  async maxAge(ctx) {
    ctx.session.maxAge = Number(ctx.query.maxAge);
    ctx.body = ctx.session;
  }
}
