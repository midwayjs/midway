# serverless spec builder

FaaS 标准 Spec 解析工具，以及用于其他平台 spec 转换的基础定义。

## API

**transform**

根据传入的标准 spec 文件和一个生成器类，转换成标准的 JSON 格式。

```ts
transform(sourcefilePath: string, builderCls?);
```

- sourcefilePath 原始 spec 文件地址
- builderCls 转换的 class(非实例)，默认为 SpecBuilder 类型，可以继承后传入

**generate**

```ts
generate(sourceFilePath: string, targetFilePath: string, builderCls?);
```

- sourcefilePath 原始 spec 文件地址
- targetFilePath 转换后的 spec 文件地址
- builderCls 转换的 class(非实例)，默认为 SpecBuilder 类型，可以继承后传入

**saveYaml**

保存 JSON 到 yml 文件

```ts
saveYaml(filePath: string, target：object);
```

- filePath 需要保存到的 yml 文件路径
- 保存到 yml 文件的 JSON 内容
