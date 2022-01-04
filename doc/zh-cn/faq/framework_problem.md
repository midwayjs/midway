# 常见框架问题

## 多个 @midwayjs/decorator 警告


`@midwayjs/decorator` 包一般来说，npm 会让相同的依赖在 node_modules 存在一份实例，其余的模块都会通过软链（link）链接到 node_modules/@midwayjs/decorator。


我们会用到下面的命令，`npm ls` 会列出项目底下某个包的依赖树。
```bash
$ npm ls @midwayjs/decorator
```
比如下图所示。
![image.png](https://img.alicdn.com/imgextra/i4/O1CN01Td86gC1tQsKjRB8XU_!!6000000005897-2-tps-541-183.png)
灰色的 `deduped` 指的就是该包是被 npm 软链到同一个模块，是正常的。


我们再来看下有问题的示例。
![image.png](https://img.alicdn.com/imgextra/i2/O1CN01gsnexD1i6lA7kM48q_!!6000000004364-2-tps-1010-308.png)


这是一个 lerna 项目，最下面的 demo-docs 中的 decorator 包，后面没有 **deduped** 标示，说明这个包是独立存在的，是错误的。


根据这个思路，我们可以逐步排查为什么会出现这种情况。


比如上图，可能是在单个模块中使用的 npm install，而不是使用 lerna 安装。


我们可以按照下面的思路逐步排查：


- 1、包含不同版本的 decorator 包（比如，package-lock 锁包，或者依赖写死版本）
- 2、未正确使用 lerna 的 hoist 模式（比如上图，可能是在单个模块中使用的 npm install，而不是使用 lerna 安装）



## xxx is not valid in current context


这个是当依赖注入容器中某个属性所关联的类在依赖注入容器中找不到爆出的。这个错误展示的可能会递归，比较深。


比如：
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01sTvqNX1NiDcoiyS2a_!!6000000001603-2-tps-1053-141.png)
错误核心就是第一个属性，在某个类中找不到。


比如上图的核心就是 `packageBuildInfoHsfService` 这个注入的类找不到。
![image.png](https://img.alicdn.com/imgextra/i2/O1CN01BBe4gu1KHhqnT0S75_!!6000000001139-2-tps-765-166.png)
这个时候，就需要去对应的类中去看，是否是 provide 出来的名字被自定义了。


常见的问题有：

- 1、Provide 装饰器导出的名字不对，无法和属性对应
- 2、Provide 为空的话，大概率是大小写没写对
- 3、注入是组件的话，可能是漏了组件名


简单的解法：`@Inject` 装饰器不加参数，属性的定义写明确的类，这样 midway 可以自动找到对应的类并注入（不适用于多态的情况）。
```typescript
@Inject()
service: PackageBuildInfoHsfService;
```