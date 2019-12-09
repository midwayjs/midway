import { CommandBase, ICommand, IHooks } from '../../core/commandBase';
export class Deploy extends CommandBase {

  getCommand(): ICommand {
    return {
    };
  }

  getHooks(): IHooks {
    return {
      'before:deploy:midway-deploy': () => {
      }
    };
  }
}
