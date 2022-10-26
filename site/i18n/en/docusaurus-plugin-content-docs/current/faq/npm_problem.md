# Common npm problems

## 1. Do not want to generate package-lock.json


In some cases, the lock version is not particularly easy to use, but there will be many strange problems. We will disable npm's function of generating `package-lock.json` files.


You can enter the following command.
```bash
$ npm config set package-lock false
```

## 2. Maximum call stack size exceeded to report an error


Generally, after npm install, npm install a package.


Solution:


- 1. Delete node_modules
- 2. Delete package-lock.json
- 3. Re-npm install



If there are still problems, you can try to try again using node v14/npm6.


## 3. Python/Canvas reported an error


Appears when installing jest module using node v15/npm7.


For example:
![image.png](https://img.alicdn.com/imgextra/i4/O1CN01fctCcQ2191p8aMfDd_!!6000000006941-2-tps-1623-295.png)


Solution: Add the `--legacy-peer-deps` parameter to npm I.


Reason: The test framework Jest relies on jsdom,npm7 will automatically install the canvas package that its peerDependencies depends on, and the installation and compilation of canvas requires a python3 environment.