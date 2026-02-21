# 规范级测试计划（5.1）

## 目标
覆盖以下规范维度，并明确“现有覆盖/待补充”：

1. API 行为
2. 默认值
3. 冲突检测
4. 版本路由
5. manifest 稳定性
6. compile pipeline
7. web-safe 边界

## 测试矩阵

### 1) API 行为
- 覆盖点：
  - `defineApi` 基础 GET/POST 行为
  - `input/output` 运行时校验
  - `useInject` 注入可用性
- 现有用例：
  - `packages/core/test/functional/api.test.ts`
  - `packages/web-koa/test/functional-parity.test.ts`
- 状态：已覆盖

### 2) 默认值
- 覆盖点：
  - 默认 `prefix/path/middleware`
  - `ignoreGlobalPrefix` 继承与 route 覆写
  - version 默认 `URI/v`
- 现有用例：
  - `packages/core/test/functional/api.test.ts`
  - `packages/core/test/service/webRouterService.test.ts`
- 状态：已覆盖

### 3) 冲突检测
- 覆盖点：
  - decorator + functional 混用冲突
  - functional 重复评估去重（HMR/重复加载）
  - 冲突错误 payload（method/fullPath/source/handler）
- 现有用例：
  - `packages/core/test/functional/api.test.ts`
  - `packages/core/test/service/webRouterService.test.ts`
- 状态：已覆盖

### 4) 版本路由
- 覆盖点：
  - URI version 前缀拼接
  - 非 URI 版本不改写 path
  - manifest 带 version 字段
- 现有用例：
  - `packages/core/test/functional/api.test.ts`
  - `packages/api-bridge/test/index.test.ts`
- 状态：已覆盖

### 5) Manifest 稳定性
- 覆盖点：
  - manifest 基础字段完整性
  - operationId 生成与重复校验
  - source=decorator/functional 区分
- 现有用例：
  - `packages/core/test/functional/api.test.ts`
- 状态：已覆盖

### 6) Compile Pipeline
- 覆盖点：
  - `server/api` 导入改写为 web-safe 契约
  - `.js` re-export -> `.ts` 源映射
  - SSR/CSR 改写开关（`target: client|ssr|both`）
- 现有用例：
  - `packages/react/test/vite.test.ts`
- 状态：已覆盖（Phase 1: React/Vite）

### 7) Web-safe 边界
- 覆盖点：
  - 浏览器 bundle 不引入 server runtime
  - build 产物可成功生成并运行
- 现有用例：
  - `samples/react-functional-api` 构建与运行验收
  - `packages/react/test/vite.test.ts`
- 状态：部分覆盖
- 待补：
  - 增加自动化 bundle 断言（扫描产物中 `@midwayjs/core` / `node:` 内置模块引用）

## 执行清单
- Core:
  - `pnpm -C packages/core test -- test/functional/api.test.ts`
  - `pnpm -C packages/core test -- test/service/webRouterService.test.ts`
  - `pnpm -C packages/core test -- test/decorator/web/requestMapping.test.ts`
- Bridge:
  - `pnpm -C packages/api-bridge test`
- React integration:
  - `pnpm -C packages/react test -- test/vite.test.ts`
  - `pnpm -C packages/react test -- test/index.test.ts`
- Standalone sample:
  - `pnpm -C samples/react-functional-api build`
  - `node samples/react-functional-api/dist/server/bootstrap.js`
  - `curl http://localhost:<port>/api/users/u-1`

## 出口标准
- 上述清单全部通过。
- 关键缺口（web-safe bundle 自动断言）列入后续任务并跟踪。
