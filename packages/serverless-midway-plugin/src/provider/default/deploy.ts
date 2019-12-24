import { CommandBase, ICommand, IHooks } from '../../core/commandBase';
export class Deploy extends CommandBase {

  getCommand(): ICommand {
    return {
      deploy: {
        usage: 'deploy to online',
        lifecycleEvents: ['midway-deploy']
      }
    };
  }

  getHooks(): IHooks {
    return {
      'after:deploy:midway-deploy': () => {
      }
    };
  }
}
