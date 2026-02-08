import { Controller, Get, Config } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Config('app.name')
  appName: string;

  @Config('app.version')
  appVersion: string;

  @Get('/')
  async home() {
    return {
      name: this.appName,
      version: this.appVersion,
    };
  }
}
