# 项目信息

- 这是 midway v4 版本的源代码，框架采用 lerna + pnpm workspace 的方式进行管理
- 采用 typescript5 作为基础语言，使用 tsc 编译，jest 测试
- midway 自研实现了 IoC MidwayContainer 容器，在 packages/core 包中，基于 DecoratorManager 和 MetadataManager 实现了依赖注入和元数据管理



# 代码编写规则
- midway 使用 core + 组件的形式进行扩展，每个组件都是一个独立的 npm 包，组件之间可以通过依赖注入进行通信
- 每个组件都必须有对应的测试用例，使用 npm run test 进行测试
- 使用 mwts （npm run lint:fix）进行代码规范检查和修复
- 增加注释，包括函数、类、接口、枚举等


# 文档编写规则
- site/docs 为当前版本的文档目录，使用 docusaurus 框架
- 编写文档要参考之前的版本，保持一致性，包括编写的风格，表述的语气，逻辑的一致等
- 使用 bash（使用 npm） 和 json 文件两种形式表述依赖安装
- 文档改动可以不用 build 检查