# TutorialKit 模板架构说明

## 📐 架构设计

### 核心理念：模板继承机制

TutorialKit 使用 **模板 + 增量覆盖** 的架构，避免重复代码，保持一致性。

## 🔍 关键发现：模板文件的可见性

### ⚠️ 重要特性

**模板文件存在于 WebContainer 文件系统中，但默认不会在文件树（File Tree）中显示。**

根据 TutorialKit 官方文档：
> "File exists on filesystem already" - 当用户尝试创建已存在于文件系统但在文件树中不可见的文件时显示的提示，例如模板文件。

### 💡 这意味着什么？

1. **模板文件确实被加载了**
   - 所有 `src/templates/default/` 中的文件都存在于 WebContainer 中
   - 应用可以正常运行，依赖可以正常解析
   - 但用户在文件树中看不到这些文件

2. **课程 `_files` 中的文件会显示**
   - 课程目录下的 `_files/` 中的文件会在文件树中显示
   - 这些文件会覆盖或添加到模板文件之上

3. **这是设计特性，不是 Bug**
   - 目的是保持文件树简洁，只显示课程相关的文件
   - 避免用户被大量的基础配置文件分散注意力

## 📂 目录结构

```
tutorial/
├── src/
│   ├── templates/
│   │   └── default/                    # 基础模板（在 WebContainer 中存在，但不显示在文件树）
│   │       ├── package.json            # ✅ 存在于 WebContainer
│   │       ├── tsconfig.json           # ✅ 存在于 WebContainer
│   │       ├── .tutorialkit.json       # 模板级配置
│   │       └── src/
│   │           ├── bootstrap.ts        # ✅ 存在于 WebContainer
│   │           ├── configuration.ts    # ✅ 存在于 WebContainer
│   │           ├── controller/         # ✅ 存在于 WebContainer
│   │           ├── service/            # ✅ 存在于 WebContainer
│   │           ├── middleware/         # ✅ 存在于 WebContainer
│   │           └── config/             # ✅ 存在于 WebContainer
│   │
│   └── content/
│       └── tutorial/
│           ├── meta.md                 # 教程级配置（指定 template: default）
│           │
│           ├── 1-getting-started/
│           │   ├── 1-project-structure/
│           │   │   ├── content.md      # 课程内容
│           │   │   └── _files/         # ❌ 空（完全使用模板）
│           │   │                       # 🎯 文件树为空是正常的！
│           │   │
│           │   └── 2-first-controller/
│           │       ├── content.md
│           │       └── _files/
│           │           └── src/
│           │               └── controller/
│           │                   └── home.controller.ts  # ✅ 这个文件会显示在文件树
│           │                                           # ✅ 覆盖模板的同名文件
│           │
│           └── 2-service-and-di/
│               ├── 1-create-service/
│               │   ├── content.md
│               │   └── _files/
│               │       └── src/
│               │           └── service/
│               │               └── user.service.ts  # ✅ 这个文件会显示在文件树
│               │                                    # ✅ 覆盖模板的同名文件
│               │
│               └── 2-inject-service/
│                   ├── content.md
│                   └── _files/
│                       └── src/
│                           ├── controller/
│                           │   └── user.controller.ts  # ✅ 显示在文件树
│                           └── service/
│                               └── user.service.ts     # ✅ 显示在文件树
```

## 🔄 文件继承规则

### 1️⃣ 第一课：项目结构介绍

```yaml
# content.md
template: default
editor:
  fileTree:
    allowEdits: false
```

**WebContainer 文件系统** = 完整的模板内容 ✅  
**文件树显示** = 空 ⚠️（模板文件不显示）

这是正常行为！应用可以运行，但文件树为空。

**解决方案**：在课程内容中通过文字和代码块展示项目结构，或者在 `_files` 中放置一个 `README.md` 等文件来显示。

### 2️⃣ 第二课：第一个控制器

```
_files/
└── src/
    └── controller/
        └── home.controller.ts  ← 仅这一个文件
```

**WebContainer 文件系统** = 模板 + 覆盖  
**文件树显示** = `src/controller/home.controller.ts` ✅

- `package.json` ← 从模板继承（不显示）
- `tsconfig.json` ← 从模板继承（不显示）
- `src/configuration.ts` ← 从模板继承（不显示）
- `src/controller/home.controller.ts` ← **从 _files 覆盖（显示在文件树）**
- `src/controller/user.controller.ts` ← 从模板继承（不显示）
- 其他所有文件 ← 从模板继承（不显示）

### 3️⃣ 服务课程：创建服务

```
_files/
└── src/
    └── service/
        └── user.service.ts  ← 仅添加这一个文件
```

**WebContainer 文件系统** = 模板 + 新增  
**文件树显示** = `src/service/user.service.ts` ✅

- 所有模板文件 ← 继承（不显示）
- `src/service/user.service.ts` ← **从 _files 添加/覆盖（显示在文件树）**

## 🎯 文件树可见性控制

### 选项 1：让文件树为空（当前方案）

```yaml
editor:
  fileTree:
    allowEdits: false
```

- ✅ 适合纯演示课程
- ✅ 用户专注于课程内容，不被文件分散注意力
- ⚠️ 文件树为空，但应用正常运行

### 选项 2：在 `_files` 中放置说明文件

```
_files/
└── README.md  ← 显示在文件树
```

- ✅ 文件树不为空，用户有可见的文件
- ✅ 可以通过 README 说明项目结构
- ⚠️ 需要在每个课程维护说明文件

### 选项 3：隐藏文件树

```yaml
editor:
  fileTree: false
```

- ✅ 完全隐藏文件树面板
- ✅ 适合纯演示课程
- ⚠️ 用户无法看到文件结构

## ✅ 最佳实践

### ✓ 应该做的

1. **理解模板文件不会显示在文件树**
   - 这是 TutorialKit 的设计特性
   - 模板文件仍然存在于 WebContainer 中
   - 应用可以正常运行

2. **在课程内容中展示结构**
   - 使用 Markdown 代码块展示项目结构
   - 使用文字描述文件的作用
   - 在需要时通过 `focus` 属性聚焦到文件

3. **渐进式展示文件**
   - 第一课：通过文字介绍结构
   - 后续课程：逐步在 `_files` 中添加需要修改的文件
   - 用户逐渐看到完整的项目结构

### ✗ 不应该做的

1. ❌ 期望模板文件显示在文件树中
2. ❌ 为了让文件树显示而复制所有模板文件到 `_files`
3. ❌ 担心文件树为空导致应用无法运行

## 💡 教学策略

### 第一课：项目结构介绍

- **目标**：让学生了解 Midway 项目的整体结构
- **方法**：
  - 在课程内容中使用代码块展示目录树
  - 解释每个目录和文件的作用
  - 使用 `focus` 属性在编辑器中展示关键文件
  - 文件树为空是正常的，因为这是纯演示课程

### 后续课程：实践操作

- **目标**：让学生动手修改代码
- **方法**：
  - 在 `_files` 中放置需要修改的文件
  - 这些文件会显示在文件树中
  - 学生可以看到并编辑这些文件
  - 其他文件（模板文件）仍然存在但不显示

## 🔧 更新模板

当需要更新所有课程的依赖时，只需修改模板：

```bash
# 更新模板的 package.json
vim src/templates/default/package.json

# 所有课程自动使用新版本（除非课程有自己的 package.json）
```

## 🎓 总结

- **模板文件** = 存在于 WebContainer，但不显示在文件树
- **课程 _files 文件** = 显示在文件树，可编辑
- **WebContainer 最终文件** = 模板 + 课程改动
- **文件树为空** ≠ 应用无法运行

这种架构让每个课程专注于它要教的内容，而不是重复维护整个项目结构！模板文件在后台默默工作，支撑着整个应用的运行。

