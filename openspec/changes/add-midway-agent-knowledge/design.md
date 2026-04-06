## Context
Midway 主仓已经具备构建 agent 知识层的核心原材料：

- `site/docs` 与 `site/versioned_docs`：教程、组件、扩展、迁移文档
- `site/versions.json` 与 Docusaurus 当前版本配置：版本边界
- `api-typedoc.json`：结构化 API 符号与源码链接
- `CHANGELOG.md`：版本演进
- `packages/mcp`：Midway 自身的 MCP 承载能力
- `@signalwire/docusaurus-plugin-llms-txt`：面向 LLM 的文本出口

当前缺口不在“有没有内容”，而在“有没有适合 agent 稳定查询的数据契约”。

## Goals / Non-Goals

- Goals:
  - 产出一套官方、版本化、可结构化查询的知识快照
  - 同时覆盖文档、API 符号、包维度和 changelog 语义
  - 为 skill、`@midwayjs/skill-midway`、MCP 提供统一数据源，而不是各自抓站点
  - 保持中英文信息与版本命中关系
  - 把“最新”明确落在当前文档版本与生成时间上

- Non-Goals:
  - 不在本 change 中实现向量搜索或复杂排序系统
  - 不让 skill 文件承载大量领域正文
  - 不把 consumer 绑定为单一命令行工具或单一 MCP 实现
  - 不引入非官方内容源

## Architecture Overview

整体分为 4 层：

### 1. Source Collection Layer
输入源：

- `site/docs/**`
- `site/i18n/en/docusaurus-plugin-content-docs/current/**`
- `site/versioned_docs/version-*/**`
- `site/.docusaurus/api-typedoc-default.json` 或对应 versioned `api-typedoc.json`
- `site/versions.json`
- `CHANGELOG.md`
- 相关 `packages/*/package.json`

该层只负责收集，不负责面向 consumer 的查询逻辑。

### 2. Normalization Layer
将多源内容转换为稳定记录：

- `DocRecord`
- `ApiRecord`
- `PackageRecord`
- `ChangelogRecord`
- `VersionRecord`

每条记录至少包含：

- `id`
- `kind`
- `version`
- `locale`
- `title`
- `summary`
- `sourcePath`
- `sourceUrl`

其中 API 记录额外包含：

- `packageName`
- `symbolName`
- `symbolKind`
- `qualifiedName`
- `since`
- `deprecated`

### 3. Bundle Distribution Layer
知识快照输出为 transport-neutral bundle，建议拆分为：

```text
midway-skill/
  manifest.json
  versions/
    4.0.0/
      docs.json
      api.json
      packages.json
      changelog.json
    3.0.0/
      docs.json
      api.json
      packages.json
      changelog.json
```

其中 `manifest.json` 提供：

- 当前版本
- 历史版本列表
- 生成时间
- 支持的 locale
- 每个 bundle 文件的路径与摘要

### 4. Consumer Layer
官方只冻结查询契约，不冻结唯一 transport。典型 consumer：

- 官方 skill
- `@midwayjs/skill-midway`
- 基于 `packages/mcp` 的参考 knowledge server
- 站点调试工具页

## Query Contract

consumer 侧必须至少支持以下查询语义：

1. `resolveVersion(target)`
   - 输入：`current`、显式 semver、`latest`
   - 输出：`resolvedVersion`、`matchType`

2. `lookupDocs({ query, version, locale })`
   - 按主题、标题、slug、标题层级匹配文档

3. `lookupApi({ symbol, packageName?, version })`
   - 按导出名、限定名、包名查 API

4. `lookupPackages({ query, version })`
   - 按包名、关键词、分类查 Midway 包

5. `lookupChangelog({ fromVersion, toVersion?, packageName? })`
   - 返回变更条目和关联版本范围

所有查询返回都必须带：

- `resolvedVersion`
- `sourceKind`
- `sourcePath`
- `sourceUrl`
- `confidence` 或 `matchType`

## Skill Design

官方 skill 只定义 SOP，不直接复制知识正文。

最小要求：

1. 触发范围
   - Midway 框架、包、装饰器、配置、生命周期、命令行工具、MCP、部署、迁移相关问题

2. 默认流程
   - 先解析版本
   - 再查 knowledge bundle
   - 命中不足时回退到官方文档页面或源码位置

3. 输出约束
   - 必须说明命中的 Midway 版本
   - 必须优先引用官方来源
   - 推断内容要显式标注是推断

## Versioning Strategy

- `current` 对应站点当前文档版本标签
- 历史版本来自 `site/versions.json`
- 查询显式版本时优先 exact match
- 无 exact match 时可回退到“同 major 下最近的已发布快照”，并向 consumer 暴露 `fallback=true`

## Freshness Strategy

知识快照生成应与文档/API 构建绑定，而不是独立手工维护。

最低要求：

- 文档构建时生成当前版本 bundle
- 版本化文档构建时保留历史 bundle
- 生成产物记录 `generatedAt`
- CI 对以下情况给出失败信号：
  - 当前文档存在但当前 bundle 缺失
  - 当前 API typedoc 存在但 API bundle 缺失
  - 版本清单与 bundle 目录不一致

## Decisions

- Decision: 先做 bundle，再做 transport
  - 原因：`@midwayjs/skill-midway`、MCP、skill 共享同一份数据契约，避免重复抓取和重复解析。

- Decision: 以 docs + typedoc 为双主源
  - 原因：Midway 的“怎么用”主要在 docs，“能调什么”主要在 typedoc，两者缺一不可。

- Decision: `latest` 不直接指 npm registry
  - 原因：对 agent 来说，最可信的“最新”应是当前站点发布并完成 bundle 生成的版本，而不是尚未同步文档的包版本。

- Decision: skill 与数据分离
  - 原因：skill 的职责是强制 agent 查询官方源，而不是变成另一本维护成本极高的手册。

## Risks / Trade-offs

- 风险：docs 与 typedoc 的版本边界不完全一致
  - Mitigation：manifest 中显式记录每个 version 的 docs/api 可用性

- 风险：历史版本文档结构差异较大，归一化复杂
  - Mitigation：先定义最小公共字段，保留 `rawSourcePath` 作为兜底

- 风险：consumer 直接依赖站点内部生成文件路径，导致后续改动成本高
  - Mitigation：consumer 只依赖 manifest 和 bundle contract，不依赖 Docusaurus 内部目录细节

## Migration Plan

1. 在 `site` 构建链路中加入 knowledge bundle 生成
2. 为当前版本与历史版本产出统一 manifest
3. 增加官方 skill 文件
4. 由 `@midwayjs/skill-midway` 与 MCP 等 consumer 消费该 bundle，而不是自行爬站点

## Open Questions

- 官方 skill 最终是保留在主仓，还是镜像发布到独立 skill 仓库？
- bundle 是直接随站点静态文件发布，还是同步发布一个轻量 npm 数据包（首选名 `@midwayjs/skill-midway`）？
- `lookupDocs` 是否需要在第一阶段支持全文倒排索引，还是先以标题/slug/heading 命中为主？
