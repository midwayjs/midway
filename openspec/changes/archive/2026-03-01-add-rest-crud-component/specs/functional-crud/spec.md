## ADDED Requirements

### Requirement: Functional CRUD Route Factory
系统 SHALL 提供函数式 CRUD 路由工厂，使用户在 Midway 函数式路由风格中无需回退到 class controller 即可暴露标准 CRUD 接口。

#### Scenario: 使用 `defineCrudRoutes()` 生成 CRUD 路由
- **WHEN** 用户调用 `defineCrudRoutes({ model, service, dto, query })`
- **THEN** 系统返回可用于生成标准 CRUD 路由的函数式定义
- **AND** 用户无需定义 class controller 或使用 `@Crud()` 才能获得 CRUD 默认路由

#### Scenario: 函数式入口从固定二级路径导出
- **WHEN** 用户使用函数式 CRUD
- **THEN** 用户通过 `@midwayjs/crud/functional` 导入 `defineCrudRoutes()`
- **AND** 系统不要求用户从 `@midwayjs/crud` 主入口导入函数式 CRUD API

#### Scenario: 函数式 CRUD 与 `defineApi()` 协同工作
- **WHEN** 用户在 `defineApi('/prefix', api => ({ ... }))` 中展开 `defineCrudRoutes()` 的结果
- **THEN** CRUD 默认路由与同一 `defineApi()` 中的自定义业务路由可并存
- **AND** 用户可在同一函数式路由对象中组合标准 CRUD 与非标准动作

### Requirement: Shared CRUD Core Across Presentation Styles
系统 SHALL 让函数式 CRUD 与 class-based CRUD 复用同一套 CRUD core，而不是复制一套平行实现。

#### Scenario: 函数式与类式共享同一 CRUD service 语义
- **WHEN** 用户分别使用 `@Crud()` 或 `defineCrudRoutes()`
- **THEN** 两种暴露方式调用同一套 `CrudService<T>` 契约
- **AND** 默认的查询协议、DTO 绑定、错误语义和删除策略保持一致

#### Scenario: 函数式 CRUD 不创建独立注册机制
- **WHEN** 系统处理 `defineCrudRoutes()`
- **THEN** 其结果直接依附现有 functional routing 生命周期
- **AND** 系统不要求为函数式 CRUD 建立独立的路由注册中心

### Requirement: Functional CRUD Minimal API Surface
系统 SHALL 为函数式 CRUD 保持最小公开 API 面，避免引入和 `defineApi()` 重复的抽象。

#### Scenario: 函数式 CRUD 以 route map 为输出
- **WHEN** 用户使用 `defineCrudRoutes()`
- **THEN** 该 API 输出的是可被 `defineApi()` 消费或合并的 route map
- **AND** 系统不要求用户学习另一套与 `defineApi()` 并列的函数式注册协议

#### Scenario: 函数式 CRUD 返回 route factory 而非独立注册对象
- **WHEN** 用户调用 `defineCrudRoutes()`
- **THEN** 该 API 返回一个接收 `api` 并产出 route map 的工厂函数
- **AND** 用户可通过 `...crudRoutes(api)` 将默认 CRUD 路由与自定义函数式路由合并

#### Scenario: 函数式 CRUD 配置尽量复用 `CrudOptions`
- **WHEN** 用户在 class-based 与 functional 两种风格间切换
- **THEN** 大部分 CRUD 配置字段保持一致
- **AND** 仅在函数式场景确有必要时才增加少量扩展字段
