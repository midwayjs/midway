---
title: 本地调试
---

## VSCode

### JavaScript Debug Terminal

在 VSCode 中创建 JavaScript Debug Terminal。
​

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1622789601759-d2634846-49f7-4487-be6f-0dc9e5f80082.png#clientId=u3a1b2f6d-ebe0-4&from=paste&height=192&id=p5BOe&margin=%5Bobject%20Object%5D&name=image.png&originHeight=192&originWidth=375&originalType=binary&size=31856&status=done&style=none&taskId=u7286159b-9369-4d17-8a6a-c43a6f52556&width=375" width="375" />

在命令行中运行命令（如 `npm start`），将自动启用调试模式。

### Debug Scripts

打开 `package.json`，查看 `scripts` 上方的 `debug` 按钮

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1622789617835-64b2099a-6b94-41c4-81fa-4f0bb0763ebb.png#clientId=u7ee4f0d0-4c66-4&from=paste&height=225&id=u459844f5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=225&originWidth=565&originalType=binary&size=26636&status=done&style=none&taskId=u3838b111-c93e-41e0-81ce-01c1bdd6ad4&width=565" width="565" />

选择 `start` 命令，既可正常的启动调试模式

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1622789623261-57851b50-421e-45fa-9dd9-95ac7d48776e.png#clientId=u7ee4f0d0-4c66-4&from=paste&height=170&id=ue315d401&margin=%5Bobject%20Object%5D&name=image.png&originHeight=170&originWidth=427&originalType=binary&size=19905&status=done&style=none&taskId=u8b079aa2-8376-4014-b48b-ed27ef66da6&width=427" width="427" />

## Jetbrains (WebStorm/IDEA...)

打开 `package.json`，选择你要执行的 `scripts` ，并点击 `debug` 按钮，即可启动本地调试

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1622789628840-eb403a2a-a864-4fd6-8f57-3f576c9b3417.png#clientId=u7ee4f0d0-4c66-4&from=paste&height=176&id=uc2a06ce8&margin=%5Bobject%20Object%5D&name=image.png&originHeight=176&originWidth=548&originalType=binary&size=28656&status=done&style=none&taskId=ucb4c5c34-6e56-47c9-a724-4ed700dce9d&width=548" width="548" />
