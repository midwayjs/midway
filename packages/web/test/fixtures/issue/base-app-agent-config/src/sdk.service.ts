import { ILogger } from "@midwayjs/core";
import { App, Config, Init, Logger, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { Application } from "egg";

@Scope(ScopeEnum.Singleton)
@Provide()
export class MySdkService {
  @App()
  app: Application;

  @Logger()
  logger!: ILogger;

  @Config('sdkConfig')
  sdkConfig;

  @Init()
  initClient() {
    console.log(this.sdkConfig);
  }
}
