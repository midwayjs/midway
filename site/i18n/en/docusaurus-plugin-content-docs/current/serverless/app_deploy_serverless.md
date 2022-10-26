# Standard Application Migration Scheme


This solution is applicable to existing EggJS,Express,Koa and other applications. It can be deployed in elastic containers of different cloud platforms to reduce deployment and operation and maintenance costs.

Some functions may not be supported and are suitable for middle and background, personal websites, etc.

There are different schemes for different projects, please select documents according to the current application type.

- [Midway application](./migrate_midway)
- [Static website](./migrate_static)
- [Express application](./migrate_express)
- [Koa application](./migrate_koa)
- [Egg application](./migrate_egg)

## What is the difference between this scheme and the migration scheme of the platform?

Midway Serverless has provided a set of application migration solutions to Serverless containers since v1.1, and each platform already has its own solutions, such as Aliyun's customRuntime access solution and various Component components of Tencent Cloud.

There are several differences:

- 1. The platform migration scheme provided by Midway Serverless is the same as the function part and **is cross-platform.** That is, the scheme is not limited to Aliyun or other cloud platforms, the code is consistent with the application period, and no (or little) modification is required.
- 2. The runtime adaptation capability of multiplexing functions can enjoy the same stable capability as functions. This adaptation capability is provided by Midway Serverless itself. The **code is open source, which is also convenient for troubleshooting and locating problems** or enhancing the capability.
- 3. Midway Serverless this set of capabilities is relatively common, and it is very easy to deploy privatization or **adapt to other application frameworks.**


## The difference between migration scheme and pure function

The migration scheme uses traditional application code, uses a fixed HTTP trigger mode during deployment, and cannot add other triggers to the project.


The migration scheme converts the input parameters of the function into traditional requests to the original function through a set of intermediate proxy layers, while pure functions do not pass through this layer of proxy, so the performance will be higher than that of the migration scheme.

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1623937490756-27bcb3d0-8d61-49af-a1f1-0efe72b5c1dc.png#clientId=ub2750586-4d72-4&from=paste&height=542&id=u06931f71&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1084&originWidth=2290&originalType=binary&ratio=2&size=120683&status=done&style=none&taskId=u4f359237-b2d5-46ad-9dfa-42fd42375fa&width=1145" width="1145" />



If you need a pure function, you can start a new pure function project.


The migration scheme is bound to a `/*` route, and a pure function can share a domain name.

## Some capacity constraints

- 1. The restrictions of platform gateways, such as Aliyun and Tencent cloud gateways, timeout time, POST size, file upload, etc., are the same as functions, that is, things that functions cannot do cannot be done in this application deployment scheme.
- 2. The application package deployment should not be too large. If it is relatively large, it can be solved by using the corresponding scheme of cloud platform, such as NAS of Aliyun or Layer of Tencent Cloud/AWS
- 3. The state part applied in the function container is handled by the application itself. This scheme is not responsible for solving this problem.
- 4. The application deployment model in the function container is a single process, and the stability is solved by the elastic container itself.
- 5. The part of the application that has long running or scheduled tasks will not be triggered without traffic. Please use other schemes instead.
- 6. Non-HTTP protocols such as socket in the application will not take effect
