# 最终架构说明

## 🎯 设计原则

### 模板提供运行基础
模板包含所有课程都需要的**基础配置文件**，确保应用可以运行。

### 课程提供业务代码
每个课程通过 `_files` 添加或覆盖**业务相关的文件**。

## 📂 文件分布

### 模板（基础配置）

```
templates/default/
├── package.json                  # 项目依赖
├── tsconfig.json                 # TypeScript 配置
└── src/
    ├── configuration.ts          # ✅ 应用配置（所有课程共享）
    └── config/
        └── config.default.ts     # ✅ 默认配置（所有课程共享）
```

**作用：**
- 提供应用启动必需的配置
- 所有课程共享这些文件
- 在文件树中不可见，但实际存在于 WebContainer

### 第一课（静态展示）

```
1-project-structure/_files/
├── README.md                     # 项目说明
├── package.json                  # 项目配置（覆盖模板）
├── tsconfig.json                 # TypeScript 配置（覆盖模板）
└── src/
    ├── bootstrap.ts              # 启动文件
    ├── controller/
    │   └── home.controller.ts    # 基础控制器
    ├── service/                  # 空目录
    └── middleware/               # 空目录
```

**配置：**
```yaml
type: lesson
title: 项目结构介绍
focus: /README.md
editor:
  fileTree:
    allowEdits: false
# 无 prepareCommands（不安装）
# 无 mainCommand（不启动）
# 无 terminal（不显示终端）
# 无 previews（不显示预览）
```

**WebContainer 文件系统：**
```
最终文件 = 模板 + 第一课 _files

实际可用文件：
- configuration.ts      ← 模板（不可见）
- config.default.ts     ← 模板（不可见）
- bootstrap.ts          ← 第一课（可见）
- home.controller.ts    ← 第一课（可见）
- package.json          ← 第一课（可见，覆盖模板）
- tsconfig.json         ← 第一课（可见，覆盖模板）
```

### 第二课（动态运行）

```
2-first-controller/_files/
└── src/
    └── controller/
        └── home.controller.ts    # 扩展的控制器
```

**配置：**
```yaml
type: lesson
title: 创建第一个 Controller
focus: /src/controller/home.controller.ts
prepareCommands:
  - npm install              # ✅ 安装依赖
mainCommand: npm run dev     # ✅ 启动应用
terminal:
  open: true                 # ✅ 显示终端
previews:
  - port: 7001              # ✅ 显示预览
```

**WebContainer 文件系统：**
```
最终文件 = 模板 + 第二课 _files

实际可用文件：
- configuration.ts      ← 模板（不可见）✅ 应用可以运行
- config.default.ts     ← 模板（不可见）✅ 应用可以运行
- home.controller.ts    ← 第二课（可见，覆盖第一课）
- package.json          ← 模板（不可见）
- tsconfig.json         ← 模板（不可见）
```

### 第三课：创建服务

```
1-create-service/_files/
└── src/
    └── service/
        └── user.service.ts       # 新增服务
```

**WebContainer 文件系统：**
```
最终文件 = 模板 + 第三课 _files

实际可用文件：
- configuration.ts      ← 模板（不可见）✅ 应用可以运行
- config.default.ts     ← 模板（不可见）✅ 应用可以运行
- user.service.ts       ← 第三课（可见）
- package.json          ← 模板（不可见）
- tsconfig.json         ← 模板（不可见）
```

## 🔄 文件继承规则

### 规则 1：模板提供基础
```
所有课程都继承模板的：
- configuration.ts
- config.default.ts
- package.json（如果课程没有覆盖）
- tsconfig.json（如果课程没有覆盖）
```

### 规则 2：课程可以覆盖
```
第一课覆盖了：
- package.json    ← 为了在文件树中显示
- tsconfig.json   ← 为了在文件树中显示

第二课没有覆盖：
- package.json    ← 使用模板的（不显示）
- tsconfig.json   ← 使用模板的（不显示）
```

### 规则 3：文件树只显示课程的 _files
```
模板文件：
- 存在于 WebContainer ✅
- 不显示在文件树 ⚠️
- 应用可以使用 ✅

课程文件：
- 存在于 WebContainer ✅
- 显示在文件树 ✅
- 应用可以使用 ✅
```

## ✅ 为什么这样设计？

### 1. 第一课需要覆盖 package.json 和 tsconfig.json

**原因：**
- 第一课要展示**完整的项目结构**
- 学生需要在文件树中看到这些文件
- 如果不覆盖，文件树中就看不到它们

**效果：**
```
第一课文件树：
✅ README.md
✅ package.json         ← 可见
✅ tsconfig.json        ← 可见
✅ src/bootstrap.ts
✅ src/controller/home.controller.ts
```

### 2. 第二课不需要覆盖 package.json 和 tsconfig.json

**原因：**
- 第二课重点是**控制器和路由**
- 不需要学生关注配置文件
- 使用模板的配置即可运行

**效果：**
```
第二课文件树：
✅ src/controller/home.controller.ts  ← 只显示核心代码

实际可用但不显示：
⚠️ package.json         ← 模板提供
⚠️ tsconfig.json        ← 模板提供
⚠️ configuration.ts     ← 模板提供
⚠️ config.default.ts    ← 模板提供
```

### 3. 模板必须提供 configuration.ts 和 config.default.ts

**原因：**
- 这是 Midway 应用启动的**必需文件**
- 第二课及以后都需要运行应用
- 如果没有这些文件，应用无法启动

**效果：**
```
第二课启动时：
1. npm install           ← 成功
2. npm run dev           ← 成功
3. mwtsc 编译            ← 找到 configuration.ts ✅
4. @midwayjs/mock 启动   ← 加载配置 ✅
5. 应用运行在 7001       ← 成功 ✅
```

## 📊 对比表

| 文件 | 模板 | 第一课 | 第二课及以后 |
|------|------|--------|------------|
| `configuration.ts` | ✅ 提供 | ❌ 不覆盖 | ❌ 不覆盖 |
| `config.default.ts` | ✅ 提供 | ❌ 不覆盖 | ❌ 不覆盖 |
| `package.json` | ✅ 提供 | ✅ 覆盖（为了展示） | ❌ 不覆盖（使用模板） |
| `tsconfig.json` | ✅ 提供 | ✅ 覆盖（为了展示） | ❌ 不覆盖（使用模板） |
| `bootstrap.ts` | ❌ | ✅ 第一课提供 | ❌ 继承第一课 |
| `home.controller.ts` | ❌ | ✅ 第一课提供 | ✅ 第二课覆盖 |

## 🎓 学习路径

```
模板（基础配置）
    ↓
第一课（静态展示完整结构）
    ├── 看到所有文件（包括配置文件）
    ├── 理解项目组织
    └── 不运行应用
    ↓
第二课（动态运行）
    ├── 只看到业务代码
    ├── 使用模板的配置（不可见但存在）✅
    ├── 运行应用
    └── 实际操作
    ↓
第三课及以后（渐进式添加）
    ├── 添加新功能
    ├── 使用模板的配置（不可见但存在）✅
    └── 持续迭代
```

## ✅ 总结

1. **模板提供运行基础**
   - `configuration.ts`
   - `config.default.ts`
   - `package.json`
   - `tsconfig.json`

2. **第一课展示完整结构**
   - 覆盖 `package.json` 和 `tsconfig.json`（为了在文件树中显示）
   - 添加 `bootstrap.ts` 和 `home.controller.ts`
   - 不运行应用（静态展示）

3. **第二课及以后实际运行**
   - 使用模板的配置文件（不显示但存在）✅
   - 只添加业务代码（显示在文件树）
   - 应用可以正常启动 ✅

这样设计确保了：
- ✅ 第一课可以展示完整结构
- ✅ 第二课及以后可以正常运行
- ✅ 代码简洁，学生专注于核心内容
