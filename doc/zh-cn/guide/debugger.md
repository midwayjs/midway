# 调试



## 在 VSCode 中调试



### 方法一：使用 JavaScript Debug Teminal

在 VSCode 的终端下拉出，隐藏着一个 `JavaScript Debug Terminal` ，点击它，创建出来的终端将自带调试能力。
<img src="https://img.alicdn.com/imgextra/i1/O1CN01HWzQEu1cQ6C7q9OYh_!!6000000003594-2-tps-1030-364.png" alt="image.png" style="zoom:50%;" />

输入任意的命令都将自动开启 Debug，比如输入 `npm run dev` 后。
![image.png](https://img.alicdn.com/imgextra/i2/O1CN01nnkbOQ1YN79M1svVV_!!6000000003046-2-tps-1500-570.png)



### 方法二：配置调试文件

创建一个 vscode 的启动文件。
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01WzgZwN23WVMLYP4Xs_!!6000000007263-2-tps-645-344.png)
随便选一个，会创建  `.vscode/launch.json` 文件，
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01pP7ntf1HRNMmTeGBT_!!6000000000754-2-tps-655-231.png)


将下面内容复制进去。
```json
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [{
        "name": "Midway Local",
        "type": "node",
        "request": "launch",
        "cwd": "${workspaceRoot}",
        "runtimeExecutable": "npm",
        "windows": {
            "runtimeExecutable": "npm.cmd"
        },
        "runtimeArgs": [
            "run",
            "dev"
        ],
        "env": {
            "NODE_ENV": "local"
        },
        "console": "integratedTerminal",
        "protocol": "auto",
        "restart": true,
        "port": 7001,
        "autoAttachChildProcesses": true
    }]
}

```

启动断点即可。
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01AGHSI51zZvrKgS9xx_!!6000000006729-2-tps-1470-1020.png)




## 在 WebStorm/Idea 中调试
开始配置 IDE。![image.png](https://img.alicdn.com/imgextra/i1/O1CN01bmrjiW1frz9dLpdEZ_!!6000000004061-2-tps-1110-692.png)
配置 npm 命令。
<img src="https://img.alicdn.com/imgextra/i1/O1CN01e4yJnU1QT3MOImlpR_!!6000000001976-2-tps-620-946.png" alt="image.png" style="zoom:50%;" />
选择你的 `package.json` 后，下拉选择 `Scrips` ，其中是你 `package.json` 中配置好的 `scripts` 中的命令，选择你要的命令，比如 `dev` 或者 `test` 等即可 。
![image.png](https://img.alicdn.com/imgextra/i2/O1CN01DBqmwD1rtbwqpuQZe_!!6000000005689-2-tps-1500-1017.png)

在代码上断点后执行调试即可。
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01sGzfeH1iLPpzSIWSg_!!6000000004396-2-tps-1327-907.png)



## 在 Chrome 中调试

如果您使用 vim 或其他代码编辑器，可以使用此方式，通过 `@midwayjs/cli` 的 `dev` 命令，添加 `--debug` 参数启动 debug 模式，可以通过 `chrome devtools` 进行单步代码调试：

![69456694-513D-4388-B52F-001562D4A520.png](https://img.alicdn.com/imgextra/i1/O1CN01jovior1pQBGiH8ao3_!!6000000005354-2-tps-1462-633.png)
您可以通过 `chrome://inspect/` 打开 `nodejs devtools` 进行断点调试：
![image.png](https://img.alicdn.com/imgextra/i4/O1CN01ntvZ5j28wDfyG5Gpe_!!6000000007996-2-tps-1464-708.png)
![image.png](https://img.alicdn.com/imgextra/i1/O1CN010Jpz2O1lp8NrFFK57_!!6000000004867-2-tps-1500-842.png)
您也可以直接通过 chrome 浏览器打开命令行中输出的 `devtools` 协议的链接，给对应代码添加断点后调试：
![10016148-385E-46A4-8B3A-0A0110BECD18.png](https://img.alicdn.com/imgextra/i1/O1CN01jOAX0U1Ggey4FsGnw_!!6000000000652-2-tps-1474-487.png)

