# Command Hook Core

基于插件生命周期 + hook的内核

## 内核使用文档
```js
import { CommandHookCore } from '@midwayjs/fcli-command-core';
const core = new CommandHookCore({
    config: {                   // 会挂载到 core.coreInstance.config 上
        servicePath: baseDir,
    },
    commands: ['invoke'],       // 默认命令，多级命令依次传入数组
    service: this.spec,         // 会挂载到 core.coreInstance.service 上
    provider: 'providerName',   // 会比对与插件中的provider是都一致来决定插件是否加载
    options: this.argv,         // 参数，会作为第二个参数传递给插件构造函数，例如 { function: 'index' }
    log: console,               // 输出及错误捕获
    displayUsage: func          // 自定义如何展示帮助 displayUsage(commandsArray, usage, this)
});
core.addPlugin(Plugin);         // 载入插件，插件支持 class / 'npm:provider:packageName' / 'local:provider:path' 三种形式
await core.ready();             // 等待初始化
await core.invoke();            // 执行默认命令
```

**core.coreInstance** 会作为第一个参数传递给插件的构造函数，上面挂载了各种方法及属性，详见 [./src/interface/commandHookCore.ts](./src/interface/commandHookCore.ts#L25) ICoreInstance

**options** 作为第二个参数传递给插件构造函数


## 插件开发文档

提供了 `BasePlugin` 插件基类，可以继承此基类编写插件

```js
import BasePlugin from 'command-core/lib/plugin';
class Plugin extends BasePlugin {
    provider = 'test'                      // provider，在插件加载时会比对provider，如果存在此属性并且与配置的provider不相同，则不加载
    commands = {                           // 命令列表
        invoke: {                          // 命令，例如 f invoke
            usage: 'test provider invoke', // 使用提示
            lifecycleEvents: ['one', 'two']// 生命周期，在执行 invoke 命令时 会依次按照 lifecycleEvents 里面声明的hook进行触发
        }
    }
    hooks = { // hook采用 prefix:command:lifesycle 的形式，prefix 包含 before和after，分别代表在之前执行还是之后执行。lifesycle即命令中 lifecycleEvents 指定的，如果hooks中不存在对应的钩子，则会跳过此生命周期
        'before:invoke:one': () => { this.core.cli.log('before:invoke:one'); }, // 所有的hooks均支持 async
        'invoke:one': async () => { this.core.cli.log('invoke:one'); },
        'after:invoke:one': () => { this.core.cli.log('after:invoke:one'); },
        'before:invoke:two': async () => { this.core.cli.log('before:invoke:two'); },
        'invoke:two': () => { this.core.cli.log('invoke:two'); },
        'after:invoke:two': async () => { this.core.cli.log('after:invoke:two'); },
    }

    async asyncInit() {
        // 可选择的同步初始化，在插件加载后调用此方法进行初始化
    }
}

export default Plugin;
```


## 插件如何进行测试？

```js
import { CommandHookCore } from '@midwayjs/fcli-command-core';
const core = new CommandHookCore({
    provider: 'providerName',
    options: {},
    commands: ['invoke'],
    log: console
});
core.addPlugin(Plugin);         // 载入你的插件
await core.ready();             // 等待初始化
await core.invoke();            // 执行对应的命令
```
