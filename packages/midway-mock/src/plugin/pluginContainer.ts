import {AliPluginContainer} from '../interfaces';

const Ready = require('ready-callback').Ready;

export class PluginContainer extends Ready implements AliPluginContainer {

  env: string;
  config: object;
  coreLogger: any;
  name: string;
  ready;
  readyCallback;
  isAllPluginReady = false;
  lastError;
  beforeStartHandler = [];
  beforeCloseHandler = [];

  constructor() {
    super();
    this.ready(() => {
      this.isAllPluginReady = true;
    });

    this.on('error', (err) => {
      this.lastError = err;
    });

    this.on('ready_timeout', (id) => {
      this.lastError = new Error(`plugin ${id} init timeout`);
    });
  }

  beforeClose(handler) {
    this.beforeCloseHandler.push(handler);
  }

  beforeStart(handler) {
    this.beforeStartHandler.push(handler);
  }

  getLogger(loggerName) {

  }
}
