# 教程文件调整总结

## ✅ 已完成的调整

### 第一章：入门

#### 1. 项目结构介绍（静态展示）
- ✅ 配置：无运行环境
- ✅ 文件：完整的项目结构
- ✅ 特点：`terminal: false`, `previews: false`

#### 2. 创建第一个 Controller
- ✅ 配置：添加运行环境
- ✅ 文件：只包含 `home()` 和 `info()` 两个方法
- ✅ 对应文档：基础路由 + 返回 JSON

#### 3. 获取请求参数
- ✅ 配置：添加运行环境
- ✅ 文件：包含所有文档提到的方法
  - `home()`, `info()` - 继承第二课
  - `greet()` - @Query 示例
  - `getUserById()` - @Param 示例
  - `search()` - 组合使用示例
  - `calculate()` - 综合实践

### 第二章：Service 和依赖注入

#### 1. 创建第一个 Service
- ✅ 配置：添加运行环境
- ✅ 文件：`user.service.ts`
  - 包含文档中提到的所有方法
  - `getUsers()`, `getUserById()`, `createUser()`
  - `updateUser()`, `deleteUser()`, `searchUsers()`

#### 2. 依赖注入的使用
- ✅ 配置：添加运行环境
- ✅ 文件：简化 `user.controller.ts`
  - 只保留 GET 方法：`list()`, `getOne()`, `search()`
  - 移除了 POST、PUT、DELETE 方法（文档中未讲）
- ✅ 对应文档：只演示依赖注入和基础查询

## 📋 调整原则

### 1. 文件内容与文档一致
- 文件中只包含文档中明确讲解的代码
- 如果文档提到"动手实践"并给出代码，文件中就包含

### 2. 渐进式学习
```
第一课 → 第二课 → 第三课
基础    添加功能   更多功能
```

### 3. 运行配置
```yaml
# 静态展示（第一课）
terminal: false
previews: false

# 动态运行（第二课及以后）
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: true
previews:
  - port: 7001
```

## 🎯 每个课程的文件内容

### 第一章
| 课程 | 文件 | 方法数 | 说明 |
|------|------|--------|------|
| 1-project-structure | 完整结构 | 1 | `home()` 基础路由 |
| 2-first-controller | home.controller.ts | 2 | `home()`, `info()` |
| 3-request-params | home.controller.ts | 6 | 添加参数获取示例 |

### 第二章
| 课程 | 文件 | 方法数 | 说明 |
|------|------|--------|------|
| 1-create-service | user.service.ts | 6 | 完整的 CRUD 方法 |
| 2-inject-service | user.controller.ts | 3 | 只有 GET 方法 |

## 📝 待处理课程

以下课程还需要检查和调整：

- [ ] 3-http-handling/1-post-request
- [ ] 3-http-handling/2-error-handling
- [ ] 4-middleware-config/1-middleware-basics
- [ ] 4-middleware-config/2-configuration
- [ ] 5-validation-best-practices/1-validation
- [ ] 5-validation-best-practices/2-best-practices

## ✅ 验证清单

每个课程都应该满足：
1. ✅ 文件内容与文档描述一致
2. ✅ 文档中提到的代码都在文件中
3. ✅ 文件中没有文档未讲的代码
4. ✅ 有正确的运行配置（除了第一课）
5. ✅ focus 指向正确的文件
