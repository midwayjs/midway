export interface IPluginInstance {
    commands?: IPluginCommands;
    hooks?: IPluginHooks;
    asyncInit?: () => Promise<any>;
}

export interface ICommandInstance {
    type?: 'entrypoint';
    lifecycleEvents?: string[];
    usage?: string;
    rank?: number;
    options?: {
        [option: string]: {
            usage: string;
            shortcut?: string;
        }
    };
    commands?: {
        [command: string]: ICommandInstance
    };
}

export interface IPluginCommands {
    [command: string]: ICommandInstance;
}

export interface IPluginHooks {
    [hook: string]: () => void | Promise<void>;
}
