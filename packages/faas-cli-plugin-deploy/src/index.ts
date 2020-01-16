import { BasePlugin, ICoreInstance } from '@midwayjs/fcli-command-core';
export class DeployPlugin extends BasePlugin {
  core: ICoreInstance;
  options: any;
  commands = {
    deploy: {
      usage: 'Deploy to online',
      lifecycleEvents: ['deploy'],
      options: {},
    },
  };
}
