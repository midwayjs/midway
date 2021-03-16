import { App, Configuration, FrameworkContainerScopeEnum, MidwayFrameworkType } from '@midwayjs/decorator';

let idx = {num: 0};
let idx2 = {num: 0};

@Configuration()
export class AutoConfiguration {
  @App()
  app;

  @App(MidwayFrameworkType.MS_GRPC)
  gRPCApp;

  async onReady() {
    console.log('a');
    idx.num++;
    this.app.getApplicationContext().registerObject('total', idx);

    this.gRPCApp.getApplicationContext().registerObject('total2', idx2);
  }
}
