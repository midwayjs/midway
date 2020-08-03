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

  hooks = {
    'after:deploy:deploy': () => {
      if (this.core.service.custom?.customDomain?.domainName) {
        this.displayDomain();
      }
    },
  };

  displayDomain() {
    const allPaths = [];
    for (const funName in this.core.service.functions) {
      const funInfo = this.core.service.functions[funName];
      for (const event of funInfo?.['events'] ?? []) {
        if (event['http']) {
          allPaths.push((event['http'].path || '/').replace(/\*/g, ''));
        }
      }
    }
    if (!allPaths.length) {
      return;
    }
    const domain = this.core.service.custom.customDomain.domainName.replace(
      /\/$/,
      ''
    );
    console.log('\nDomain bind: ' + domain);
    for (const path of allPaths) {
      console.log(`- path bind: http://${domain}/${path.replace(/^\//, '')}`);
    }
  }
}
