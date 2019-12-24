# Command Hook Core

基于插件生命周期 + hook的内核

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
import CommandHookCore from 'command-core';
const core = new CommandHookCore({
    provider: 'providerName',
    options: {},
    log: console
});
core.addPlugin(Plugin);         // 载入你的插件
await core.ready();             // 等待初始化
await core.invoke(['command']); // 执行对应的命令
```
