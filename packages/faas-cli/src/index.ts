import { BaseCLI } from '@midwayjs/fcli-command-core';
import { TestPlugin } from '@midwayjs/fcli-plugin-test';
import { InvokePlugin } from '@midwayjs/fcli-plugin-invoke';
import { PackagePlugin } from '@midwayjs/fcli-plugin-package';
import { DeployPlugin } from '@midwayjs/fcli-plugin-deploy';
import { AliyunFcPlugin } from '@midwayjs/fcli-plugin-fc';

export class CLI extends BaseCLI {
  loadDefaultPlugin() {
    this.core.addPlugin(InvokePlugin);
    this.core.addPlugin(TestPlugin);
    this.core.addPlugin(PackagePlugin);
    this.core.addPlugin(DeployPlugin);
    this.core.addPlugin(AliyunFcPlugin);
  }
}
