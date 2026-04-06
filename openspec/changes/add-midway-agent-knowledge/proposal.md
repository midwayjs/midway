# Change: 提供 Midway 官方 Agent Knowledge Bundle 与 Skill

## Why
当前 Midway 已经同时拥有三类对 agent 很有价值的官方信息源：

- `site/docs` 与 `site/versioned_docs` 中的版本化文档
- Docusaurus/TypeDoc 生成的 API 元数据（如 `api-typedoc.json`）
- `CHANGELOG.md`、包清单、MCP 能力等运行时与发布信息

但这些内容仍然主要面向人类页面浏览，缺少一个“可版本化、可结构化、可被 agent 直接消费”的官方知识层。结果是：

1. agent 容易只基于记忆回答，无法稳定对齐 Midway 最新版本能力；
2. MCP、skill、LLM 文档入口与潜在命令行消费者之间没有统一的数据契约；
3. 文档更新后，即使站点已同步，agent 侧也没有官方“最新快照”可以消费。

`ant-design/antd-skill` 的有效点不在单个 `SKILL.md`，而在于“skill 只负责 SOP，真实数据由结构化 provider 提供”。Midway 也需要一套同类但更适合自身仓库结构的官方方案。

## What Changes
- 新增 capability：`agent-knowledge`
- 定义 Midway 官方 `Agent Knowledge Bundle`，从文档、TypeDoc API、版本信息、changelog 和包元数据生成结构化快照
- 定义版本解析与回退规则，使 consumer 可以稳定查询 `current`、显式版本和历史版本
- 定义 transport-neutral 查询契约，供未来的 `@midwayjs/skill-midway`、MCP server、站点调试页和其他 agent 工具共同消费
- 定义 Midway 官方 skill 的最小 SOP：何时触发、先查什么、如何引用版本和来源、何时回退到站点页面
- 定义更新与发布流程，确保文档/API 更新后知识快照同步刷新，而不是长期漂移

## Design Direction
本 change 只冻结设计，不直接开始实现。整体方向如下：

1. **数据归一化优先**
   - 不手写知识库正文；
   - 直接复用 `site/docs`、`site/versioned_docs/*`、`api-typedoc.json`、`versions.json`、`CHANGELOG.md` 等已有官方资产。

2. **传输层后置**
   - 先统一 bundle 契约，再由 `@midwayjs/skill-midway`、MCP、静态文件或其他运行时去消费；
   - 避免把知识格式与某个单独工具强耦合。

3. **版本感知为第一原则**
   - `current` 代表站点当前版本；
   - 历史版本沿用 `site/versions.json`；
   - 查询时必须返回“命中版本”与“是否回退”。

4. **skill 只做行为编排**
   - `SKILL.md` 不承载大量知识正文；
   - 由 skill 强制 agent 在 Midway 问题上优先查询官方 knowledge provider。

## Impact
- Affected specs: `agent-knowledge`（新增）
- Affected code（实施阶段预期）:
  - `site/` 下文档构建与生成脚本
  - `site/docusaurus.config.js` 相关知识输出挂钩
  - `packages/mcp/*` 的参考接入方式或示例
  - Midway 官方 skill 文件及其分发脚本/目录
  - `@midwayjs/skill-midway` 包及其他 consumer 对该 bundle 的消费逻辑

## Scope Boundaries
- 本提案不要求在当前仓库里实现完整搜索引擎。
- 本提案不要求立即实现完整命令行工具；首选官方包名为 `@midwayjs/skill-midway`，而不是新的 `cli` 包。
- 本提案不要求改变现有 Docusaurus 页面结构或 Typedoc 页面路由。
- 本提案不纳入社区博客、第三方教程、Issue/Discussion 等非官方内容。
