import { Application } from 'egg';

const VALIDATOR: any = Symbol('Application#_validator');

export = {
  get _validator() {
    const app: Application = this as any;
    console.log('app[VALIDATOR]', app);
    if (app instanceof Application) {
      return app[VALIDATOR];
    } else {
      throw new Error('not same');
    }
  }
};
