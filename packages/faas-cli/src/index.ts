import { BaseCLI } from '@midwayjs/fcli-command-core';
import { TestPlugin } from '@midwayjs/fcli-plugin-test';
import { InvokePlugin } from '@midwayjs/fcli-plugin-invoke';

export class CLI extends BaseCLI {
  loadDefaultPlugin() {
    this.core.addPlugin(InvokePlugin);
    this.core.addPlugin(TestPlugin);
  }
}
