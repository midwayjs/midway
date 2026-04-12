## ADDED Requirements
### Requirement: Development Source Loader Boundary
系统 SHALL 将 functional 一体化开发期的源码加载兼容逻辑限定在 `@midwayjs/mock` 的开发链路内，而不是放入 `@midwayjs/core` 的通用模块加载器。

#### Scenario: mock 持有开发期源码加载逻辑
- **WHEN** 用户通过 Vite 或 Rspack 开发插件启动 functional 一体化项目
- **THEN** 开发期针对 TypeScript/ESM/decorator 的源码加载兼容逻辑由 `@midwayjs/mock` 提供
- **AND** `@midwayjs/core` 不需要感知 dev-only 的源码 fallback 或临时文件机制

#### Scenario: core loadModule 保持标准加载职责
- **WHEN** 运行时调用 `@midwayjs/core` 的通用模块加载能力
- **THEN** 其职责限定为标准 `require/import` 与 `safeLoad` 语义
- **AND** 不承担 functional 一体化开发期的源码转译或 specifier fallback 逻辑

### Requirement: Shared Mock Dev Loader for Vite and Rspack
系统 SHALL 让 Vite 与 Rspack 的 functional 开发插件复用同一套 mock source loader，以保证行为一致。

#### Scenario: Vite 与 Rspack 共用 source loader
- **WHEN** 用户分别通过 Vite 或 Rspack 启动 functional 开发环境
- **THEN** 两条链路都通过 `@midwayjs/mock` 的统一 source loader 加载 `src/server` 源码
- **AND** 不为不同 bundler 维护两套独立的 TS/ESM 兼容实现

#### Scenario: 临时产物不触发重复 reload
- **WHEN** mock source loader 在开发期生成内部临时产物或缓存文件
- **THEN** Vite/Rspack watcher 不会把这些内部文件视为业务源码变更
- **AND** 应用不会因内部临时文件产生重复 reload

### Requirement: Functional Dev Runtime Compatibility on Node 20
系统 SHALL 在 Node 20 下支持 functional 一体化开发链路的源码直跑，包括 ESM、TypeScript、本地相对依赖、decorator 与 metadata。

#### Scenario: Node 20 下加载 configuration 与 functional api 源码
- **WHEN** 用户在 Node 20 下启动 functional 一体化开发环境
- **THEN** `src/server/configuration.ts`、`src/server/index.ts` 与 `src/server/api/**/*.ts` 可被成功加载
- **AND** 本地相对依赖与 bare package import 能保持可解析

#### Scenario: Node 20 下保留 decorator metadata 行为
- **WHEN** 开发期源码模块包含 Midway 装饰器、属性注入或 `reflect-metadata` 相关语义
- **THEN** 其运行时行为与标准 TypeScript 编译结果保持兼容
- **AND** 不因开发期源码加载兼容逻辑导致 metadata 丢失或装饰器语义异常
