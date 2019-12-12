import { CommandBase, ICommand, IHooks } from '../../core/commandBase';
export class Deploy extends CommandBase {

  getCommand(): ICommand {
    return {
    };
  }

  getHooks(): IHooks {
    return {
      'after:deploy:midway-deploy': () => {
      }
    };
  }
}
