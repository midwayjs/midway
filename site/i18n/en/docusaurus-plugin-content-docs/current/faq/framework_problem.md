# Frequently Asked Framework Issues

## Multiple @midwayjs/decorator warnings

`@midwayjs/decorator` Package Generally speaking, npm will allow the same dependency to have an instance in the node_modules, and the rest of the modules will be linked to the node_modules/@midwayjs/decorator through a soft link.


In the following command, `npm ls` lists the dependency trees of a package under the project.
```bash
$ npm ls @midwayjs/decorator
```
The ratio is shown in the following figure.
![image.png](https://img.alicdn.com/imgextra/i4/O1CN01Td86gC1tQsKjRB8XU_!!6000000005897-2-tps-541-183.png)
The gray `deduped` means that the package is linked to the same module by npm soft, which is normal.


Let's look at the problematic examples.
![image.png](https://img.alicdn.com/imgextra/i2/O1CN01gsnexD1i6lA7kM48q_!!6000000004364-2-tps-1010-308.png)


This is a lerna project. The decorator package in the bottom demo-docs is not **deduped** marked at the back, indicating that this package exists independently and is wrong.


According to this idea, we can gradually investigate why this happened.


For example, the above figure may be npm install used in a single module instead of lerna installation.


We can gradually investigate according to the following ideas:


- 1. Contains different versions of decorator packages (for example, package-lock lock packages, or depend on hard-coded versions)
- 2. The hoist mode of lerna is not used correctly (for example, the above figure may be the npm install used in a single module instead of lerna installation)



## xxx is not valid in current context


This is when the class associated with an attribute in the dependency injection container cannot be found in the dependency injection container. This error may be recursive and deeper.

For example:
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01sTvqNX1NiDcoiyS2a_!!6000000001603-2-tps-1053-141.png)
The core of the error is the first attribute, which cannot be found in a class.


For example, the core of the above figure is `packageBuildInfoHsfService` this injected class cannot be found.
![image.png](https://img.alicdn.com/imgextra/i2/O1CN01BBe4gu1KHhqnT0S75_!!6000000001139-2-tps-765-166.png)
At this time, you need to go to the corresponding class to see if the provide name has been customized.


Common problems are:

- 1. The name exported by the Provide decorator is incorrect and cannot correspond to the attribute.
- 2. If the Provide is empty, the high probability is that the case is not written correctly.
- 3. If the injection is a component, the component name may be missing.


Simple solution: The `@Inject` decorator does not add parameters, and the property definition is clearly written to the class, so that the midway can automatically find the corresponding class and inject it (not applicable to polymorphisms).
```typescript
@Inject()
service: PackageBuildInfoHsfService;
```

## TypeError: (0 ,decorator_1.Framework) is not a function

The reason is that the wrong version is used, such as the lower version of the framework and the higher version of the component (the 2.x framework uses the 3.x component).

![](https://img.alicdn.com/imgextra/i3/O1CN01G7gzCj1EkCpW1gaJl_!!6000000000389-2-tps-1461-491.png)

Solution: Confirm your large version of the framework (@midwayjs/core version is the framework version), select the corresponding document, and use the corresponding component.
