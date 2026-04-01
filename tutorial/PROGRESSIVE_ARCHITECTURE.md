# TutorialKit 渐进式教学架构

## 🎯 设计理念

**从最小可运行项目开始，随着课程推进逐步添加功能**

## 📊 架构对比

### ❌ 之前：模板包含所有代码

```
templates/default/src/
├── controller/
│   ├── home.controller.ts    ← 所有功能都在模板
│   └── user.controller.ts    ← 所有功能都在模板
├── service/
│   └── user.service.ts       ← 所有功能都在模板
└── middleware/
    └── logger.middleware.ts  ← 所有功能都在模板

问题：
- 学生一开始就看到所有代码
- 无法体现渐进式学习
- 教学顺序不清晰
```

### ✅ 现在：模板只有基础配置，功能逐步添加

```
templates/default/src/
├── configuration.ts          ← 仅保留核心配置
└── config/
    └── config.default.ts     ← 仅保留基础配置

每个课程通过 _files 逐步添加：
- 第一课：添加基础 controller
- 第二课：添加路由装饰器
- 第三课：添加 service
- 第四课：添加 DI 注入
```

## 📂 渐进式文件结构

### 模板（最小化基础）

```
templates/default/
├── package.json              ✅ 依赖配置
├── tsconfig.json             ✅ TypeScript 配置
└── src/
    ├── configuration.ts      ✅ 应用配置
    └── config/
        └── config.default.ts ✅ 基础配置
```

### 第一课：项目结构介绍

```
1-project-structure/_files/
├── README.md                 ← 项目说明
├── package.json              ← 项目配置和依赖
├── tsconfig.json             ← TypeScript 配置
└── src/
    ├── bootstrap.ts          ← 启动文件
    ├── configuration.ts      ← 应用配置
    ├── config/
    │   └── config.default.ts ← 默认配置
    ├── controller/
    │   └── home.controller.ts  ← 最简单的控制器
    ├── service/              ← 空目录（展示结构）
    └── middleware/           ← 空目录（展示结构）

教学重点：
- 理解 Midway 项目的完整结构
- 认识各个目录和文件的作用
- 最简单的路由：GET /
```

### 第二课：控制器和路由

```
2-first-controller/_files/
└── src/
    └── controller/
        └── home.controller.ts  ← 扩展的控制器

新增功能：
- @Get, @Post, @Query, @Param
- 多个路由方法
- 参数装饰器

文件树显示：
✅ src/controller/home.controller.ts（覆盖第一课的文件）
```

### 第三课：创建服务

```
1-create-service/_files/
└── src/
    └── service/
        └── user.service.ts  ← 添加服务

新增功能：
- @Provide 装饰器
- 业务逻辑层
- CRUD 方法

文件树显示：
✅ src/service/user.service.ts（新文件）
```

### 第四课：依赖注入

```
2-inject-service/_files/
└── src/
    ├── controller/
    │   └── user.controller.ts  ← 使用服务的控制器
    └── service/
        └── user.service.ts

新增功能：
- @Inject 装饰器
- 控制器中使用服务
- 完整的 CRUD API

文件树显示：
✅ src/controller/user.controller.ts（新文件）
✅ src/service/user.service.ts（继承自第三课）
```

## 🔄 文件继承规则

### WebContainer 文件系统组成

```
最终文件系统 = 模板 + 当前课程 _files + 之前课程的累积

例如第四课：
├── package.json              ← 模板
├── tsconfig.json             ← 模板
└── src/
    ├── configuration.ts      ← 模板
    ├── config/               ← 模板
    ├── controller/
    │   ├── home.controller.ts  ← 第二课（被覆盖）
    │   └── user.controller.ts  ← 第四课（新增）
    ├── service/
    │   └── user.service.ts   ← 第三课/第四课
    └── middleware/           ← 空目录（第一课创建）
```

### 文件树显示规则

**只显示当前课程 `_files` 中的文件**

- 第一课文件树：`README.md`, `src/controller/home.controller.ts`
- 第二课文件树：`src/controller/home.controller.ts`（更新版）
- 第三课文件树：`src/service/user.service.ts`
- 第四课文件树：`src/controller/user.controller.ts`, `src/service/user.service.ts`

## 📚 教学顺序

### 第一章：入门

1. **项目结构介绍**
   - 展示完整目录结构
   - 最简单的 GET / 路由
   - 理解配置文件

2. **控制器和路由**
   - 路由装饰器：@Get, @Post, @Put, @Del
   - 参数装饰器：@Query, @Param, @Body
   - RESTful API 设计

### 第二章：服务和依赖注入

3. **创建服务**
   - @Provide 装饰器
   - 业务逻辑分层
   - CRUD 方法实现

4. **依赖注入**
   - @Inject 装饰器
   - IoC 容器概念
   - 控制器使用服务

### 第三章：中间件和配置（待实现）

5. **自定义中间件**
   - 添加 `middleware/logger.middleware.ts`
   - 中间件执行顺序
   - 全局中间件 vs 路由中间件

6. **配置管理**
   - 多环境配置
   - 配置注入
   - 配置优先级

## ✅ 优势

1. **渐进式学习曲线**
   - 从简单到复杂
   - 每节课专注一个概念
   - 知识点逐步累积

2. **清晰的教学路径**
   - 文件树只显示当前课程的改动
   - 学生清楚地知道每节课添加了什么
   - 避免信息过载

3. **易于维护**
   - 模板只包含必要的基础配置
   - 每节课的改动独立
   - 修改某节课不影响其他课程

4. **符合实际开发流程**
   - 从最小可运行项目开始
   - 逐步添加功能
   - 类似真实项目的迭代过程

## 🔧 实现细节

### 模板精简原则

模板只包含：
- ✅ 项目配置文件（package.json, tsconfig.json）
- ✅ 应用配置（configuration.ts, config.default.ts）
- ❌ 不包含任何业务代码
- ❌ 不包含示例 controller、service、middleware

### 课程添加原则

每节课通过 `_files` 添加：
- ✅ 该课程要教授的代码
- ✅ 需要覆盖的已有文件
- ❌ 不重复添加模板已有的配置
- ❌ 不重复添加之前课程的代码（除非要修改）

## 🎓 总结

**模板 = 最小可运行基础**  
**课程 = 渐进式功能添加**  
**学习 = 一步一步构建完整应用**

这种架构让学生：
- 清楚地看到每节课学了什么
- 理解每个功能的添加顺序
- 体验从零开始构建应用的过程
