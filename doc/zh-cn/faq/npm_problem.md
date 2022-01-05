## 1、不希望生成 package-lock.json


在某些时候，锁版本不是特别好用，反而会出现不少奇怪的问题，我们会禁用 npm 的生成 `package-lock.json` 文件的功能。


可以输入下面的命令。
```bash
$ npm config set package-lock false
```


# 常见 npm 问题

## 2、Maximum call stack size exceeded 报错


一般在 npm install 之后，再 npm install 某个包导致的。


解法：


- 1、删除 node_modules
- 2、删除 package-lock.json
- 3、重新 npm install



如果还有问题，可以尝试使用 node v14/npm6 重试。


## 3、Python/Canvas 报错


出现在使用 node v15/npm7 安装 jest 模块。


比如：
![image.png](https://img.alicdn.com/imgextra/i4/O1CN01fctCcQ2191p8aMfDd_!!6000000006941-2-tps-1623-295.png)


解决方案：npm i 时添加 `--legacy-peer-deps`  参数。


原因：测试框架 Jest 依赖 jsdom，npm7 会自动安装其 peerDependencies 中依赖的 canvas 包， 而 canvas 的安装编译需要有python3环境。