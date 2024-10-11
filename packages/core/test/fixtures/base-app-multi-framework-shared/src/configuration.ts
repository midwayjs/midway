import { App, Configuration } from '../../../../src';

let idx = {num: 0};
let idx2 = {num: 0};

@Configuration({
})
export class AutoConfiguration {
  @App()
  app;

  @App('grpc')
  gRPCApp;

  async onReady() {
    console.log('a');
    idx.num++;
    this.app.getApplicationContext().registerObject('total', idx);
    this.gRPCApp.getApplicationContext().registerObject('total2', idx2);
  }
}
