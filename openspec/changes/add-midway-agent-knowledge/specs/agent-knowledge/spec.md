## ADDED Requirements

### Requirement: Versioned Official Knowledge Snapshots
系统 SHALL 从 Midway 官方文档与 API 资产生成可版本化的 agent knowledge snapshots。

#### Scenario: 生成当前版本知识快照
- **WHEN** 站点构建当前文档版本
- **THEN** 系统生成对应当前版本的 knowledge snapshot
- **AND** snapshot 记录生成时间、版本号和可用数据切片

#### Scenario: 保留历史版本知识快照
- **WHEN** 仓库存在 `site/versioned_docs` 中的历史版本文档
- **THEN** 系统为这些历史版本生成或保留对应 knowledge snapshot
- **AND** consumer 可按显式版本查询这些快照

### Requirement: Unified Docs And API Knowledge Contract
系统 SHALL 将文档、API 符号、包信息与 changelog 统一到同一知识契约中，而不是由 consumer 分别抓取不同源。

#### Scenario: 文档页被归一化为稳定记录
- **WHEN** 系统处理 Midway 官方文档页面
- **THEN** 每个页面至少包含稳定 `id`、标题、版本、locale、来源路径和来源 URL
- **AND** consumer 无需理解 Docusaurus 内部文件结构即可消费

#### Scenario: API 符号被归一化为稳定记录
- **WHEN** 系统处理 TypeDoc 生成的 API 元数据
- **THEN** 每个 API 记录至少包含包名、符号名、符号类型、版本和来源信息
- **AND** consumer 可按符号名或包名稳定查询

#### Scenario: Changelog 与包信息进入统一知识层
- **WHEN** 系统处理 changelog 与包元数据
- **THEN** consumer 可通过同一知识契约查询版本变更与相关包信息
- **AND** 不要求 consumer 额外解析 `CHANGELOG.md` 或多个 `package.json`

### Requirement: Version-aware Query Resolution
系统 SHALL 提供明确的版本解析与回退语义，避免 agent 在“当前版本”和“历史版本”之间混淆。

#### Scenario: 查询显式版本命中对应快照
- **WHEN** consumer 传入一个存在的显式 Midway 版本
- **THEN** 系统返回该版本的知识快照结果
- **AND** 响应包含 `resolvedVersion`

#### Scenario: 查询不存在的精确版本时允许安全回退
- **WHEN** consumer 传入一个不存在的显式版本
- **THEN** 系统可回退到同 major 下最近的已发布快照
- **AND** 响应必须标明发生了回退而不是伪装成 exact match

#### Scenario: 查询 current 或 latest
- **WHEN** consumer 传入 `current` 或 `latest`
- **THEN** 系统解析到当前官方文档版本
- **AND** 不直接以外部 registry 中的最新包版本替代文档版本

### Requirement: Transport-neutral Consumer Contract
系统 SHALL 定义不绑定特定 transport 的查询契约，以便 skill、`@midwayjs/skill-midway`、MCP 等 consumer 共用同一数据源。

#### Scenario: `@midwayjs/skill-midway` 复用统一查询契约
- **WHEN** 官方 `@midwayjs/skill-midway` 包消费 Midway knowledge
- **THEN** 该包通过统一查询契约访问 snapshot
- **AND** 不需要自行重新解析站点页面

#### Scenario: MCP consumer 复用统一查询契约
- **WHEN** 基于 Midway 的 MCP server 提供文档/API 查询能力
- **THEN** 它复用同一知识契约
- **AND** 不引入独立的第二套知识格式

### Requirement: Official Agent Skill Workflow
系统 SHALL 提供 Midway 官方 skill，用于约束 agent 在 Midway 相关任务中优先查询官方 knowledge provider。

#### Scenario: 处理 Midway 技术问题时优先查官方 knowledge
- **WHEN** agent 接到 Midway 框架、包、装饰器、配置、迁移或 MCP 相关任务
- **THEN** 官方 skill 指导 agent 优先查询 knowledge provider
- **AND** 不应在可查询时仅依赖记忆回答

#### Scenario: 输出带版本与来源
- **WHEN** agent 使用官方 knowledge provider 回答 Midway 问题
- **THEN** 输出包含命中的 Midway 版本与官方来源
- **AND** 推断内容必须与直接来源区分

### Requirement: Freshness And Release Guard
系统 SHALL 将知识快照更新纳入文档/API 发布流程，避免官方文档与 agent 知识层长期漂移。

#### Scenario: 当前文档更新时同步刷新 snapshot
- **WHEN** 当前版本文档或 API 元数据发生变化
- **THEN** 知识快照在构建或发布流程中同步刷新
- **AND** 新 snapshot 的生成时间可被 consumer 感知

#### Scenario: 关键快照缺失时阻断发布
- **WHEN** 当前版本存在官方 docs 或 API 资产但对应 snapshot 缺失
- **THEN** CI 或发布流程给出失败信号
- **AND** 不允许静默发布不完整的 knowledge bundle
