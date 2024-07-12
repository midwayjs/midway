import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Version check tool

Due to the uncertainty of the installed version of dependencies, Midway provides a version check tool `midway-version`, which can quickly check compatibility errors between versions.

## Check compatibility

You can use the following command to execute the check in the project root directory.

The following command will check the version actually installed in `node_modules`, not the version written in `package.json`.

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

## Upgrade to the latest version

You can use the following command to execute the upgrade in the project root directory.

The `-u` parameter will check all midway modules and upgrade them to the `latest` version according to the actual installed version in `node_modules` and the version written in `package.json`.

If the currently installed component version is `3.16.2` and the latest version is `3.18.0`, you will be prompted to upgrade to `3.18.0`.

When using the `-u -w` parameter:

* Update the version of `package.json` and keep the prefix, for example, `^3.16.0` will become `^3.18.0`
* Write the `3.18.0` version to the lock file (if exists)

<Tabs groupId="midway-version">

<TabItem value="npm" label="npm">

```bash
$ npx midway-version@latest -u
```

After confirming that the output is correct, you can use the `-w` parameter to write the `package.json` and `package-lock.json` files (if exists).

```bash
$ npx midway-version@latest -u -w
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
$ pnpx midway-version@latest -u
```

After the output is confirmed to be correct, you can use the `-w` parameter to write `package.json` and `pnpm-lock.yaml` files (if exists).

```bash
$ pnpx midway-version@latest -u -w
```

</TabItem>

<TabItem value="yarn" label="yarn">

```bash
$ yarn add midway-version@latest
$ yarn midway-version -u
```

After the output is confirmed to be correct, you can use the `-w` parameter to write `package.json` and `yarn.lock` files (if exists).

```bash
$ yarn midway-version -u -w
```

</TabItem>

</Tabs>

## Upgrade to the latest compatible version

The `-m` parameter will check all midway modules and upgrade them to the `latest compatible` version according to the actual installed version in `node_modules` and the version written in `package.json`.

If the currently installed component version is `3.16.0`, the latest version is `3.18.0`, and the compatible versions are `3.16.1` and `3.16.2`, it will prompt to upgrade to `3.16.2`.

The `-m` parameter is generally used to fix the lower version and check the wrong component version, so the strategy is different from `-u`.

When using the `-m -w` parameter:

* Update the version of `package.json`

* If there is a lock file, the prefix will be retained, such as `^3.16.0` will become `^3.16.2`

* If there is no lock file, the prefix will be removed and the version will be fixed, such as `^3.16.0` will become `3.16.2`

* Write the `3.16.2` version to the lock file (if any)

<Tabs groupId="midway-version">

<TabItem value="npm" label="npm">

```bash
$ npx midway-version@latest -m
```

After confirming that the output is correct, you can use the `-w` parameter to write the `package.json` and `package-lock.json` files (if exists).

```bash
$ npx midway-version@latest -m -w
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
$ pnpx midway-version@latest -m
```

After the output is confirmed to be correct, you can use the `-w` parameter to write `package.json` and `pnpm-lock.yaml` files (if exists).

```bash
$ pnpx midway-version@latest -m -w
```

</TabItem>

<TabItem value="yarn" label="yarn">

```bash
$ yarn add midway-version@latest
$ yarn midway-version -m
```

After the output is confirmed to be correct, you can use the `-w` parameter to write `package.json` and `yarn.lock` files (if exists).

```bash
$ yarn midway-version -m -w
```

</TabItem>

</Tabs>