import { App, Configuration, Inject } from '@midwayjs/decorator';
import * as view from '../../../../src';
import { join } from 'path'

@Configuration({
  imports: [view],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  @App()
  app;

  @Inject()
  env: view.NunjucksEnvironment;

  async onReady(){
    // this.app.locals = { a: 'app', b: 'app', c: 'app' };
    this.env.addFilter('hello', (str) => {
      return 'hi, ' + str;
    });

    console.log(this.env.getFilter('hello'));
    console.log(this.env.hasExtension('.njk'));

    this.env.addGlobal('a', 'app');
    this.env.addGlobal('b', 'app');
    this.env.addGlobal('c', 'app');
  }
}
