---
title: 本地调试
---

## 在 VSCode 中调试

### 方法一：使用 JavaScript Debug Teminal

在 VSCode 的终端下拉出，隐藏着一个 `JavaScript Debug Terminal` ，点击它，创建出来的终端将自带调试能力。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1600961364664-67885e44-3308-4c98-95ff-1af398dba9ae.png#crop=0&crop=0&crop=1&crop=1&height=182&id=UBgAF&margin=%5Bobject%20Object%5D&name=image.png&originHeight=364&originWidth=1030&originalType=binary&ratio=1&rotation=0&showTitle=false&size=141353&status=done&style=none&title=&width=515" width="515" />

输入任意的命令都将自动开启 Debug，比如输入 `npm run dev`  后。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1600961451349-29b4b0a7-5863-4ff3-a66c-db58eb1cc199.png#crop=0&crop=0&crop=1&crop=1&height=522&id=NkQPJ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1044&originWidth=2746&originalType=binary&ratio=1&rotation=0&showTitle=false&size=212246&status=done&style=none&title=&width=1373" width="1373" />

### 方法二：配置调试文件

创建一个 vscode 的启动文件。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1612503130603-a83b5e41-e6b9-49e6-be5a-4bfb993b48b7.png#crop=0&crop=0&crop=1&crop=1&height=344&id=kRdF4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=344&originWidth=645&originalType=binary&ratio=1&rotation=0&showTitle=false&size=28531&status=done&style=none&title=&width=645" width="645" />

随便选一个，会创建 `.vscode/launch.json` 文件，

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1612503193927-26976931-b53a-4144-bd57-c4d178d2d8ec.png#crop=0&crop=0&crop=1&crop=1&height=231&id=nIc4g&margin=%5Bobject%20Object%5D&name=image.png&originHeight=231&originWidth=655&originalType=binary&ratio=1&rotation=0&showTitle=false&size=21494&status=done&style=none&title=&width=655" width="655" />

将下面内容复制进去。

```json
{
  // 使用 IntelliSense 了解相关属性。
  // 悬停以查看现有属性的描述。
  // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Midway Local",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceRoot}",
      "runtimeExecutable": "npm",
      "windows": {
        "runtimeExecutable": "npm.cmd"
      },
      "runtimeArgs": ["run", "dev"],
      "env": {
        "NODE_ENV": "local"
      },
      "console": "integratedTerminal",
      "protocol": "auto",
      "restart": true,
      "port": 7001,
      "autoAttachChildProcesses": true
    }
  ]
}
```

启动断点即可。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1612503389173-0f8e3219-0fe7-43d7-89c2-f0283bc249a9.png#crop=0&crop=0&crop=1&crop=1&height=1020&id=uw08t&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1020&originWidth=1470&originalType=binary&ratio=1&rotation=0&showTitle=false&size=199463&status=done&style=none&title=&width=1470" width="1470" />

## 在 WebStorm/Idea 中调试

​

开始配置 IDE。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1587031125652-b33f5a18-8ae1-405f-b1a9-bd6ea923e099.png#crop=0&crop=0&crop=1&crop=1&height=346&id=jq74g&margin=%5Bobject%20Object%5D&name=image.png&originHeight=692&originWidth=1110&originalType=binary&ratio=1&rotation=0&showTitle=false&size=83457&status=done&style=none&title=&width=555" width="555" />

配置 npm 命令。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1608369067606-9bd2faf2-757c-44e6-8ce1-c2d32508aedf.png#crop=0&crop=0&crop=1&crop=1&height=473&id=qhCMB&margin=%5Bobject%20Object%5D&name=image.png&originHeight=946&originWidth=620&originalType=binary&ratio=1&rotation=0&showTitle=false&size=146092&status=done&style=none&title=&width=310" width="310" />

选择你的 `package.json`  后，下拉选择 `Scrips` ，其中是你 `package.json`  中配置好的 `scripts`  中的命令，选择你要的命令，比如 `dev`  或者 `test`  等即可 。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1608369181502-5d1fabff-595a-4dd2-90a4-69e4d5963062.png#crop=0&crop=0&crop=1&crop=1&height=533&id=TJViO&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1066&originWidth=1572&originalType=binary&ratio=1&rotation=0&showTitle=false&size=189712&status=done&style=none&title=&width=786" width="786" />

在代码上断点后执行调试即可。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1587031866061-68fa841d-6030-45b3-ab74-adfa4264df74.png#crop=0&crop=0&crop=1&crop=1&height=454&id=VKEnS&margin=%5Bobject%20Object%5D&name=image.png&originHeight=907&originWidth=1327&originalType=binary&ratio=1&rotation=0&showTitle=false&size=193255&status=done&style=none&title=&width=663.5" width="663.5" />

###

## 在 Chrome 中调试

如果您使用 vim 或其他代码编辑器，可以使用此方式，通过 `@midwayjs/cli` 的 `dev` 命令，添加 `--debug` 参数启动 debug 模式，可以通过 `chrome devtools` 进行单步代码调试：

<img src="https://cdn.nlark.com/yuque/0/2021/png/128621/1635994136312-f1eda8ba-165d-4322-82b8-b21d3b9c6beb.png#clientId=u32db4720-b7d0-4&crop=0&crop=0&crop=1&crop=1&from=ui&height=317&id=z4u1f&margin=%5Bobject%20Object%5D&name=69456694-513D-4388-B52F-001562D4A520.png&originHeight=666&originWidth=1538&originalType=binary&ratio=1&rotation=0&showTitle=false&size=276022&status=done&style=none&taskId=ud161d835-1e96-4246-8061-c795e9a0ff1&title=&width=731" width="731" />

您可以通过 `chrome://inspect/` 打开 `nodejs devtools` 进行断点调试：

<img src="https://cdn.nlark.com/yuque/0/2021/png/128621/1635995391144-a9ec0d4a-c6fb-4638-a292-615a3588d33d.png#clientId=u069cda7c-313b-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=354&id=u4986bfa4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=942&originWidth=1948&originalType=binary&ratio=1&rotation=0&showTitle=false&size=572568&status=done&style=none&taskId=u07555349-8e09-42b2-bd94-f93160b0431&title=&width=732" width="732" />

<img src="https://cdn.nlark.com/yuque/0/2021/png/128621/1635995418427-282d256a-de65-4eba-9a83-b474d3d74f9f.png#clientId=u069cda7c-313b-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=445&id=u83271ad1&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1280&originWidth=2280&originalType=binary&ratio=1&rotation=0&showTitle=false&size=710504&status=done&style=none&taskId=uc2614db9-dea9-48d7-b87d-8cb608c8770&title=&width=792" width="792" />

您也可以直接通过 chrome 浏览器打开命令行中输出的 `devtools` 协议的链接，给对应代码添加断点后调试：

<img src="https://cdn.nlark.com/yuque/0/2021/png/128621/1635994137067-f663409a-483d-41f5-bc86-4798182edb38.png#clientId=u32db4720-b7d0-4&crop=0&crop=0&crop=1&crop=1&from=ui&height=243&id=GooAh&margin=%5Bobject%20Object%5D&name=10016148-385E-46A4-8B3A-0A0110BECD18.png&originHeight=950&originWidth=2878&originalType=binary&ratio=1&rotation=0&showTitle=false&size=744085&status=done&style=none&taskId=u892d9925-9206-4946-a1ed-cb6043c557d&title=&width=737" width="737" />
