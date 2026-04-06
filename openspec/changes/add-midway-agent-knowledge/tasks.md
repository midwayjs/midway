# 实施任务清单

## 1. Bundle 契约冻结
- [ ] 1.1 冻结 `manifest.json` 字段与版本解析规则（`current`、`latest`、显式版本、fallback）
- [ ] 1.2 冻结 `DocRecord`、`ApiRecord`、`PackageRecord`、`ChangelogRecord` 的最小公共字段
- [ ] 1.3 冻结 bundle 目录结构与文件拆分策略
- [ ] 1.4 冻结 bilingual 字段组织方式（单记录双语言或分 locale 记录）

## 2. 数据提取设计
- [ ] 2.1 定义 `site/docs`、`site/versioned_docs` 的提取规则
- [ ] 2.2 定义 Typedoc JSON 的符号抽取与裁剪规则
- [ ] 2.3 定义包级元数据与 changelog 的抽取规则
- [ ] 2.4 定义文档标题、slug、heading、摘要的归一化规则

## 3. Consumer 契约设计
- [ ] 3.1 冻结 `resolveVersion`、`lookupDocs`、`lookupApi`、`lookupPackages`、`lookupChangelog` 的输入输出
- [ ] 3.2 冻结 source attribution 字段，确保 consumer 可显示来源
- [ ] 3.3 设计 `@midwayjs/skill-midway` 包的参考适配方式
- [ ] 3.4 设计 MCP consumer 的参考适配方式

## 4. Skill 设计
- [ ] 4.1 编写 Midway 官方 skill 的触发条件与默认 SOP
- [ ] 4.2 冻结“必须标注版本与来源”的输出约束
- [ ] 4.3 明确 skill 与 knowledge provider 的分层边界

## 5. 构建与发布流程
- [ ] 5.1 设计 `site` 构建期生成 knowledge bundle 的挂载点
- [ ] 5.2 设计当前版本与历史版本 bundle 的同步策略
- [ ] 5.3 设计 CI freshness gate 与缺失检测
- [ ] 5.4 明确站点发布、bundle 发布、consumer 升级之间的顺序关系

## 6. 验证与验收
- [ ] 6.1 增加 OpenSpec capability spec 并覆盖核心场景
- [ ] 6.2 运行 `openspec validate add-midway-agent-knowledge --strict --no-interactive`
- [ ] 6.3 完成设计评审后再进入实现阶段
