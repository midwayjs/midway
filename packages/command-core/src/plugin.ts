import { IPluginInstance, IPluginHooks, IPluginCommands } from './interface/plugin';
import { ICoreInstance } from './interface/commandHookCore';

export = class BasePlugin implements IPluginInstance {
    public core: ICoreInstance;
    public options: any;
    public commands: IPluginCommands;
    public hooks: IPluginHooks;
    constructor(core: ICoreInstance, options: any) {
        this.core = core;
        this.options = options;
        this.commands = {};
        this.hooks = {};
    }
};
