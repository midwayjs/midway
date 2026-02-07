# 贡献指南

感谢您对 Midway.js 交互式教程的关注！我们欢迎各种形式的贡献。

## 贡献方式

### 1. 报告问题

如果您发现教程中的问题：

- 内容错误或过时
- 代码示例无法运行
- 拼写或语法错误
- 不清晰的说明

请在 GitHub 上提交 Issue，包含：
- 问题描述
- 所在章节
- 截图（如果适用）

### 2. 改进内容

#### 修正错误

1. Fork 仓库
2. 找到相关的 markdown 文件（在 `src/content/tutorial-zh/` 下）
3. 修改内容
4. 提交 Pull Request

#### 添加新课程

1. 在合适的部分创建新目录
2. 创建 `content.md` 文件
3. 遵循现有课程的格式
4. 更新对应的 `meta.md` 文件
5. 添加必要的示例代码

### 3. 完善代码示例

代码示例位于 `src/templates/default/src/`：

```
src/templates/default/src/
├── controller/     # Controller 示例
├── service/        # Service 示例
├── middleware/     # 中间件示例
├── config/         # 配置示例
└── ...
```

改进建议：
- 确保代码可以运行
- 添加详细注释
- 遵循最佳实践
- 保持简洁易懂

## 内容编写规范

### Markdown 格式

#### 标题层级

```markdown
# 一级标题 - 课程标题
## 二级标题 - 主要部分
### 三级标题 - 小节
#### 四级标题 - 要点
```

#### 代码块

TypeScript 代码：
````markdown
```typescript
import { Controller } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  // ...
}
```
````

Bash 命令：
````markdown
```bash
pnpm install
```
````

#### 强调标记

- **粗体** - 重要概念
- `代码` - 代码片段、文件名、类名
- > 引用 - 注意事项
- ✅ / ❌ - 正确/错误示例

#### 列表

有序列表：
```markdown
1. 第一步
2. 第二步
3. 第三步
```

无序列表：
```markdown
- 要点一
- 要点二
- 要点三
```

任务列表：
```markdown
- [x] 已完成
- [ ] 未完成
```

### 内容结构

每个课程应包含：

1. **引言** - 说明本课要学什么
2. **核心概念** - 解释关键概念
3. **代码示例** - 提供完整可运行的示例
4. **代码解析** - 逐步解释代码
5. **实践建议** - 鼓励读者动手尝试
6. **小结** - 总结要点

### 示例模板

```markdown
---
type: lesson
title: 课程标题
---

# 课程标题

简短的引言，说明本课的目标和重要性。

## 核心概念

解释主要概念，可以包含：
- 定义
- 为什么需要
- 使用场景

## 代码示例

提供完整的代码示例：

\```typescript
// 代码示例
\```

## 代码解析

### 1. 第一部分

解释第一部分的代码...

### 2. 第二部分

解释第二部分的代码...

## 动手实践

鼓励读者修改代码，尝试不同的实现。

## 小结

✅ 要点一
✅ 要点二
✅ 要点三

下一节，我们将学习...
```

## 技术要求

### 开发环境

- Node.js 18+
- pnpm 8+
- Git

### 本地测试

1. Fork 并 clone 仓库：
```bash
git clone https://github.com/your-username/open-midway-v3.git
cd open-midway-v3/tutorial
```

2. 安装依赖：
```bash
pnpm install
```

3. 启动开发服务器：
```bash
pnpm dev
```

4. 在浏览器中测试您的更改

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加适当的类型注解
- 包含必要的注释

## Pull Request 流程

1. **创建分支**
```bash
git checkout -b feature/improve-lesson-1
```

2. **提交更改**
```bash
git add .
git commit -m "描述您的更改"
```

3. **推送到 GitHub**
```bash
git push origin feature/improve-lesson-1
```

4. **创建 Pull Request**
   - 访问 GitHub 仓库
   - 点击 "New Pull Request"
   - 填写详细的说明
   - 等待审核

### PR 描述模板

```
## 更改类型
- [ ] 修正错误
- [ ] 改进内容
- [ ] 添加新课程
- [ ] 更新代码示例

## 更改说明
简要描述您的更改...

## 影响范围
- 第 X 部分，第 Y 课
- 文件：xxx.md

## 测试
- [ ] 本地测试通过
- [ ] 代码示例可运行
- [ ] 无拼写错误

## 截图
（如果适用）
```

## 内容审核标准

我们会审核：

1. **准确性** - 内容是否正确
2. **清晰度** - 是否易于理解
3. **完整性** - 是否涵盖关键点
4. **一致性** - 与其他内容是否一致
5. **代码质量** - 示例是否遵循最佳实践

## 行为准则

- 尊重他人
- 建设性反馈
- 保持友善和专业
- 接受不同观点

## 认可贡献者

我们会在以下地方认可贡献者：

- README.md 的贡献者列表
- 发布说明
- 社交媒体

## 联系方式

如有疑问，可以通过以下方式联系：

- GitHub Issues
- GitHub Discussions
- Midway.js 社区

再次感谢您的贡献！🎉
