import { IServerless, ICommandOptions, ICommandParam } from '../../interface/midwayServerless';
export const hackInit = async(serverless: IServerless, commands: ICommandOptions, options: ICommandParam) => {
  console.log('hack init');
};

export const hackRun = async (serverless: IServerless, commands: ICommandOptions, options: ICommandParam) => {
  console.log('hack run');
};
