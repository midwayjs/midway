# How to update Midway



## When will Midway be updated

In general, you may need to update in the following cases:

- 1. After Midway has sent a new version, when you want to use the new functions
- 2. When you install a new component with lock file
- 3. When there is an error that cannot be found in the method
- ... and so on

For example, when the following error occurs

1. Generally, it is a new package with components installed, but the old @midwayjs/core does not include this method, thus reporting an error.

![](https://img.alicdn.com/imgextra/i3/O1CN01dDNRZr1MBPewPo7Xg_!!6000000001396-2-tps-1196-317.png)

2. The general reason is that the version of @midwayjs/core that mock depends on does not have this method, indicating that the version is incorrect. It may be that the version is incorrectly referenced, or the version may be too low.

![](https://img.alicdn.com/imgextra/i3/O1CN01HVMJKP1xNuFO2Wv73_!!6000000006432-2-tps-1055-135.png)

3. When a new component is installed, we find that there is more than one version instance of a package

![](https://img.alicdn.com/imgextra/i3/O1CN01jZxQu91YBCs0N9S9Y_!!6000000003020-2-tps-1133-43.png)

## Update considerations

:::danger

**Do not**:


- 1. Upgrade a @midwayjs/* package separately
- 2. Remove the symbol from the version number in package.json

:::




## General item update


For projects that normally use npm/yarn, please follow the following procedure for upgrading


- 1. delete package-lock.json or yarn.lock
- 2. completely delete node_modules (such as rm -rf node_modules)
- 3. Reinstall dependency (npm install or yarn)



**We do not guarantee the effect of using other tools and cli separate upgrade packages.**




## Lerna project update


If you use lerna to develop a project, due to the existence of hoist mode, please follow the following procedure (take lerna3 as an example)



- 1. Clean up the node_modules of subpackages, such as (lerna clean -- yes)
- 2. Delete the node_modules of the main package (such as rm -rf node_modules)
- 3. delete package-lock.json or yarn.lock
- 4. Reinstall Dependency (npm install & & lerna bootstrap)



**We do not guarantee the effect of using other tools and cli separate upgrade packages.**


## Major version update


You must manually change the version number, for example, from `^ 1.0.0` to `^ 2.0.0`.



## View current package version


The Midway package is managed and released using the standard Semver version. The version specified in `package.json` usually starts with `^`, indicating that it is compatible in a wide range of versions.


For example, if `@midwayjs/core` is set to `^ 2.3.0` in `package.json`, the latest version of `2.x` is installed according to npm installation rules.


Therefore, it is normal that the actual installed version is higher than the version specified in `package.json`.


You can use `npm ls package name` to view the specific version, such as `npm ls @midwayjs/core` to view the version of `@midwayjs/core`.


## Version matching query


Because lerna packages have certain dependencies, for example, the modified package will only be updated. **The version of the package under the midway may not be the same.**


For example, it is normal that the version of `@midwayjs/Web` is higher than that of `@midwayjs/core`.


Midway submits a [@midwayjs/version](https://www.npmjs.com/package/@midwayjs/version) package at each conference, which contains each of our versions and all the package versions matched by that version. Please [visit here](https://github.com/midwayjs/midway/tree/2.x/packages/version/versions) to view it.


The file names in the directory are created according to the `@midwayjs/decorator version-@midwayjs/core version. json` rule. Each version corresponds to a JSON file.


The file content uses the package name as the key and the compatible matching version name as the value.


For example, the egg-layer package versions compatible with the current file decorator(v2.10.18) and core(v2.10.18) are v2.10.18 and v2.10.19.


If the file name of the combination of decorator and core is not found, or the versions in the file do not match, there may be a **version problem**.


Examples of content are as follows:
```json
{
  "@midwayjs/egg-layer": [
    "2.10.18",
    "2.10.19"
  ],
  "@midwayjs/express-layer": "2.10.18",
  "@midwayjs/faas-typings": "2.10.7",
  "@midwayjs/koa-layer": "2.10.18",
  "@midwayjs/runtime-engine": "2.10.14",
  "@midwayjs/runtime-mock": "2.10.14",
  "@midwayjs/serverless-app": "2.10.18",
  "@midwayjs/serverless-aws-starter": "2.10.14",
  "@midwayjs/serverless-fc-starter": "2.10.18",
  "@midwayjs/serverless-fc-trigger": "2.10.18",
  "@midwayjs/serverless-http-parser": "2.10.7",
  "@midwayjs/serverless-scf-starter": "2.10.14",
  "@midwayjs/serverless-scf-trigger": "2.10.18",
  "@midwayjs/static-layer": "2.10.18",
  "@midwayjs/bootstrap": "2.10.18",
  "@midwayjs/cache": "2.10.18",
  "@midwayjs/consul": "2.10.18",
  "@midwayjs/core": "2.10.18",
  "@midwayjs/decorator": "2.10.18",
  "@midwayjs/faas": "2.10.18",
  "@midwayjs/grpc": "2.10.18",
  "@midwayjs/logger": "2.10.18",
  "midway-schedule": "2.10.18",
  "midway": [
    "2.10.18",
    "2.10.19"
  ],
  "@midwayjs/mock": "2.10.18",
  "@midwayjs/prometheus": "2.10.18",
  "@midwayjs/rabbitmq": "2.10.18",
  "@midwayjs/socketio": "2.10.18",
  "@midwayjs/task": [
    "2.10.18",
    "2.10.19"
  ],
  "@midwayjs/typegoose": "2.10.18",
  "@midwayjs/version": [
    "2.10.18",
    "2.10.19"
  ],
  "@midwayjs/express": "2.10.18",
  "@midwayjs/koa": "2.10.18",
  "@midwayjs/web": [
    "2.10.18",
    "2.10.19"
  ]
}
```
