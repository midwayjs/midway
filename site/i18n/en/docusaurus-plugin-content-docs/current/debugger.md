# Debugger

This section describes how to debug a Midway project in a common editor.

## Debugging in VSCode

### Method 1: Use JavaScript Debug Teminal

Pull out under the VSCode terminal and hide a `JavaScript Debug Terminal`. Click on it and the created terminal will have its own debugging capability.
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01HWzQEu1cQ6C7q9OYh_!!6000000003594-2-tps-1030-364.png)

If you enter any command, Debug is automatically enabled. For example, after you enter `npm run dev`.
![image.png](https://img.alicdn.com/imgextra/i2/O1CN01nnkbOQ1YN79M1svVV_!!6000000003046-2-tps-1500-570.png)



### Method 2: Configure debug files

Create a startup file for vscode.
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01WzgZwN23WVMLYP4Xs_!!6000000007263-2-tps-645-344.png)
Select any one and create a `.vscode/launch.json` file,
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01pP7ntf1HRNMmTeGBT_!!6000000000754-2-tps-655-231.png)


Copy the following.

```json
{
    // Use IntelliSense to understand related attributes.  
    // Hover to view a description of an existing attribute.
    // For more information, please visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0 ",
    "configurations": [{
        "name": "Midway Local ",
        "type": "node ",
        "request": "launch ",
        "cwd": "${workspaceRoot} ",
        "runtimeExecutable": "npm ",
        "windows": {
            "runtimeExecutable": "npm.cmd"
        },
        "runtimeArgs": [
            "run ",
            "dev"
        ],
        "env": {
            "NODE_ENV": "local"
        },
        "console": "integratedTerminal ",
        "protocol": "auto ",
        "restart": true
        "port": 7001
        "autoAttachChildProcesses": true
    }]
}

```

Just start the breakpoint.
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01AGHSI51zZvrKgS9xx_!!6000000006729-2-tps-1470-1020.png)



## Debugging in WebStorm/Idea

Start configuring IDE.
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01bmrjiW1frz9dLpdEZ_!!6000000004061-2-tps-1110-692.png)

Configure the npm command.
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01e4yJnU1QT3MOImlpR_!!6000000001976-2-tps-620-946.png)

After you select `package.json`, drop down and select `Scrips`, which is the command in the `scripts` configured in `package.json`. Select the command you want, such as `dev` or `test`.
![image.png](https://img.alicdn.com/imgextra/i2/O1CN01DBqmwD1rtbwqpuQZe_!!6000000005689-2-tps-1500-1017.png)

Debugging can be performed after the code breakpoint.
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01sGzfeH1iLPpzSIWSg_!!6000000004396-2-tps-1327-907.png)

