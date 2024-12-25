# 向 Midway 贡献

Midway 是一款开源框架，欢迎大家为社区贡献力量，本文介绍如何向 Midway 提交 issue，贡献代码，文档等。



## 报告问题

如果你在开发过程中遇到了一些问题，你无法解决需要想开发者问询的，我们强烈建议：

- 1、先在文档中查找相关的问题
- 2、如果查找后无法解决，可以提交一个 [Q&A](https://github.com/midwayjs/midway/discussions/new/choose)。



在提交的内容时，请遵守下列规范。

- 1、在标题或内容中清楚地解释你的目的，中文或者英文均可。
- 2、在内容中描述以下内容
  - 如果是个新需求，请详细描述需求内容，最好有伪代码实现
  - 如果是一个 BUG，请提供复现步骤，错误日志，截图，相关配置，框架版本等可以让开发者快速定位问题的内容
  - 如果可以，请尽可能提供一个最小可复现的代码仓库，方便调试
- 3、在您报告问题之前，请搜索相关问题。确保您不会打开重复的问题



开发者会在看到时进行标记问题，回复或者解决问题。



## 修复代码问题

如果你发现框架有一些待修改的问题，可以通过 PR 来提交。



### PR 流程

1、首先在 [midway github](https://github.com/midwayjs/midway) 右上角 fork 一个仓库，到自己的空间下。

2、git clone 该仓库到本地或者其他 IDE 环境，进行开发或者修复工作。

```bash
# 创建新分支
$ git checkout -b branch-name
# 安装依赖
$ npm i
# 构建项目
$ npm run build

# 开发并执行测试
$ npm test

$ git add . # git add -u to delete files
$ git commit -m "fix(role): role.use must xxx"
$ git push origin branch-name
```

3、创建一个 Pull Request，选择将自己的项目分支，合并到目标 midwayjs/midway 的 main 分支。

4、系统自动会创建 PR 到 midway 仓库下，在测试通过后，开发者会合并此 PR。



### 提交规范

- 1、一般 PR 使用英文标题
- 2、提交前缀使用 `fix`，`chore`，`feat` ，`docs`字段，用于快速标示修复的类型。 



## 修复文档问题

和普通 PR 类似，如果是单篇文档，可以使用快速编辑的方式提交。



### 单篇文档快速修复

- 1、打开官网需要修复的文档，点击左下角 [Edit this page](#) 链接，会跳转到 Github 对应的文档
- 2、点击 “笔型” 按钮，进入编辑页面
- 3、编辑内容后，将提交的标题修改为 `docs: xxxx`，点击提交按钮创建 PR
- 4、等待开发者合并



### 多篇文档修复

和普通 PR 相同，clone 仓库，提交，注意，提交 PR 的标题为 `docs: xxx`。
