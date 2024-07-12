import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 版本检查工具

由于依赖安装版本的不确定性，Midway 提供了 `midway-version` 这一版本检查工具，可以快速检查版本之间的兼容性错误。



## 检查兼容性

你可以使用下面的命令在项目根目录执行进行检查。

以下命令会检查 `node_modules` 中实际安装的版本，而非 `package.json` 中写的版本。

<Tabs groupId="midway-version">

<TabItem value="npm" label="npm">

```bash
$ npx midway-version@latest
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
$ pnpx midway-version@latest
```

</TabItem>

<TabItem value="yarn" label="yarn">

```bash
$ yarn add midway-version@latest
$ yarn midway-version
```

</TabItem>

</Tabs>



## 升级到最新版本

你可以使用下面的命令在项目根目录执行进行升级。

`-u` 参数会检查 midway 所有模块，根据 `node_modules` 中实际安装的版本以及 `package.json` 中编写的版本，将其升级到 `最新` 版本。

如当前安装的组件版本为 `3.16.2`，最新版本为 `3.18.0` ，则会提示升级到 `3.18.0`。

在使用  `-u -w` 参数时：

* 更新 `package.json` 的版本，保留前缀写法，比如 `^3.16.0` 会变为 `^3.18.0`
* 将 `3.18.0` 版本写入到锁文件（如有）

<Tabs groupId="midway-version">

<TabItem value="npm" label="npm">

```bash
$ npx midway-version@latest -u
```

输出确认无误后，可以使用 `-w` 参数写入 `package.json` 和 `package-lock.json` 文件（如有）。

```bash
$ npx midway-version@latest -u -w
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
$ pnpx midway-version@latest -u
```

输出确认无误后，可以使用 `-w` 参数写入 `package.json` 和 `pnpm-lock.yaml` 文件（如有）。

```bash
$ pnpx midway-version@latest -u -w
```

</TabItem>

<TabItem value="yarn" label="yarn">

```bash
$ yarn add midway-version@latest
$ yarn midway-version -u
```

输出确认无误后，可以使用 `-w` 参数写入 `package.json` 和 `yarn.lock` 文件（如有）。

```bash
$ yarn midway-version -u -w
```

</TabItem>

</Tabs>



## 升级到可兼容的最新版本

`-m` 参数会检查 midway 所有模块，根据 `node_modules` 中实际安装的版本以及 `package.json` 中编写的版本，将其升级到 `最新的兼容` 版本。

如当前安装的组件版本为 `3.16.0`，最新版本为 `3.18.0` ，兼容版本为 `3.16.1` 和 `3.16.2`，则会提示升级到 `3.16.2`。

一般使用 `-m` 参数的场景为固化低版本，检查错误的组件版本，所以策略和 `-u` 有所不同。

在使用 `-m -w` 参数时：

* 更新 `package.json` 的版本
  * 如果有锁文件，将会保留前缀，比如 `^3.16.0` 会变为 `^3.16.2`
  * 如果没有锁文件，将会移除前缀，固定版本，比如 `^3.16.0` 会变为 `3.16.2`

* 将 `3.16.2` 版本写入到锁文件（如有）

<Tabs groupId="midway-version">

<TabItem value="npm" label="npm">

```bash
$ npx midway-version@latest -m
```

输出确认无误后，可以使用 `-w` 参数写入 `package.json` 和 `package-lock.json` 文件（如有）。

```bash
$ npx midway-version@latest -m -w
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
$ pnpx midway-version@latest -m
```

输出确认无误后，可以使用 `-w` 参数写入 `package.json` 和 `pnpm-lock.yaml` 文件（如有）。

```bash
$ pnpx midway-version@latest -m -w
```

</TabItem>

<TabItem value="yarn" label="yarn">

```bash
$ yarn add midway-version@latest
$ yarn midway-version -m
```

输出确认无误后，可以使用 `-w` 参数写入 `package.json` 和 `yarn.lock` 文件（如有）。

```bash
$ yarn midway-version -m -w
```

</TabItem>

</Tabs>

