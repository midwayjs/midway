# Midway Skill 使用

`@midwayjs/skill-midway` 是 Midway 官方提供的 AI Skill 包。

它主要解决两个问题：

- 在项目里安装一份和当前 Midway 版本对应的 Skill
- 在本地查询 Midway 的文档、API、包信息和变更记录

如果你希望在 Codex、Cursor、Trae 等 AI 编程工具里获得更稳定的 Midway 上下文，推荐在项目里安装这个包。

## 安装依赖

在项目中安装依赖：

```bash
$ npm i @midwayjs/skill-midway@4 --save-dev
```

或者在 `package.json` 中增加如下依赖后重新安装：

```json
{
  "devDependencies": {
    "@midwayjs/skill-midway": "^4.0.0"
  }
}
```

## 安装到 AI 工具

### 交互式安装

如果你不确定要安装到哪个工具，可以直接执行：

```bash
$ npx midway-skill install
```

命令会进入交互式选择，让你选择安装目标。

### 指定安装目标

也可以显式指定目标。下面只是常见示例：

```bash
$ npx midway-skill install --target codex
$ npx midway-skill install --target cursor
$ npx midway-skill install --target trae
```

如果你希望一次安装到所有已支持的工具：

```bash
$ npx midway-skill install --target all
```

当前已支持的目标包括：

```text
amazon-q
antigravity
auggie
claude
cline
codebuddy
codex
continue
costrict
crush
cursor
factory
gemini
github-copilot
iflow
kilocode
kiro
opencode
pi
qoder
qwen
roocode
trae
windsurf
```

默认安装是**项目级**的，会写入当前项目目录，而不是写入全局目录。

例如：

- Codex: `.codex/skills/midway/SKILL.md`
- Cursor: `.cursor/commands/opsx-midway.md`
- Trae: `.trae/skills/midway/SKILL.md`

如果你后续升级了 `@midwayjs/skill-midway`，可以执行：

```bash
$ npx midway-skill update
```

或者：

```bash
$ npx midway-skill update --target codex
```

## 查询 Midway 文档和 API

这个包也提供了一组本地查询命令，适合给 AI 工具或脚本调用。

### 解析版本

先解析用户请求的 Midway 版本：

```bash
$ npx midway-skill resolve-version 3.20.12
```

如果没有传版本，默认使用当前版本。

### 查询文档

```bash
$ npx midway-skill lookup-docs --query "mcp"
$ npx midway-skill lookup-docs --query "configuration" --locale en
```

### 查询 API

```bash
$ npx midway-skill lookup-api --symbol "Configuration"
$ npx midway-skill lookup-api --symbol "MidwayMCPFramework" --package "@midwayjs/mcp"
```

### 查询包信息

```bash
$ npx midway-skill lookup-packages --query "mcp"
```

### 查询变更记录

```bash
$ npx midway-skill lookup-changelog --package "@midwayjs/mcp"
```

所有查询命令都会输出 JSON，便于 AI 工具直接消费。

## 版本说明

- 当前 major 版本：支持 `docs + api + changelog`
- 历史 major 版本：支持 `docs + changelog`

这意味着历史大版本通常不保证精确 API 查询。如果你查询的是旧版本 API，结果可能为空，这属于预期行为。
