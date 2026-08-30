## Context

Bootstrap 目前把显式 `imports` 与约定式项目入口合并。该行为适合追加组件，但无法表达“使用这组入口替换默认入口”，也让 `imports: []` 与未传 `imports` 没有区别。

## Goals / Non-Goals

- Goals: 让 `imports` 具备清晰的覆盖语义，并允许应用按启动场景选择不同 Configuration 和框架。
- Goals: 保持未配置 `imports` 的普通应用继续使用约定式 `configuration.ts` 或 `configuration.js`。
- Goals: 统一同步和异步初始化行为，并兼容接口已经声明的单模块输入。
- Non-Goals: 改变 `@Configuration({ imports })` 的组件导入语义。
- Non-Goals: 改变默认项目入口的文件查找顺序。
- Non-Goals: 在同一应用上下文中支持多个主框架并行运行。

## Decisions

- Decision: 以 `imports === undefined` 判断是否启用默认入口探测。这样可以保留 `[]` 的明确含义，而不会把空数组当成缺省值。
- Decision: 在进入组件加载流程前，把单模块输入标准化为数组，避免对非 iterable 模块对象使用展开运算符。
- Decision: 同步和异步准备函数共享同一输入语义；异步路径仍通过异步模块加载器解析默认入口。
- Alternatives considered: 增加 `autoLoadEntry: false`。该选项能保持 4.x 兼容，但会长期保留 `imports` 的混合语义；5.x 主版本更适合直接收敛契约。

## Risks / Trade-offs

- 依赖“显式 imports 后仍自动追加默认入口”的应用会缺少项目 Configuration。迁移文档将要求这类应用把默认 Configuration 显式加入 `imports`。
- `imports: []` 将从“仍加载默认入口”变成“不加载任何入口”，可能导致没有框架的启动流程按现有规则报错。这是预期且需要测试锁定的行为。

## Migration Plan

4.x 中如下代码会隐式加载默认入口：

```ts
Bootstrap.configure({
  imports: [customConfiguration],
});
```

5.x 中如需保留原行为，应显式列出默认入口：

```ts
Bootstrap.configure({
  imports: [customConfiguration, defaultConfiguration],
});
```

未传 `imports` 的应用无需修改。
