import { Bootstrap } from '@midwayjs/bootstrap';
import { Framework } from '@midwayjs/web';
import { EventEmitter } from 'events';

export class Application extends EventEmitter {
  eggOptions;
  config: {
    cluster: {
      clusterConfig: {
        https;
        listen: {
          port: number;
        }
      };
    }
  };
  bootstrap;
  framework;

  constructor(options: {
    https: {
      key: string;
      cert: string;
    };
    port: number;
  }) {
    super();
    this.eggOptions = options;

    this.bootstrap = Bootstrap.configure({
      baseDir: __dirname,
    });

    this.framework = new Framework().configure({
      processType: 'application'
    });
    this.bootstrap.load(this.framework);
  }

  ready() {
    return this.bootstrap.run();
  }

  callback() {
    return this.framework.getApplication();
  }

  close() {
    return this.bootstrap.stop();
  }
}

export class Agent extends EventEmitter {
  bootstrap;
  framework;
  eggOptions;

  constructor(options: {
  }) {
    super();
    this.eggOptions = options;

    this.bootstrap = Bootstrap.configure({
      baseDir: __dirname,
    });

    this.framework = new Framework().configure({
      processType: 'agent'
    });
    this.bootstrap.load(this.framework);
  }

  ready() {
    return this.bootstrap.run();
  }

  close() {
    return this.bootstrap.stop();
  }
}
