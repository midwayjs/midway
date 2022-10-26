# Application Migration FAQ

## What is the difference between this scheme and the migration scheme of the platform?

Midway Serverless has provided a set of application migration solutions to Serverless containers since v1.1, and each platform already has its own solutions, such as Aliyun's customRuntime access solution and various Component components of Tencent Cloud.

There are several differences:

- 1. The platform migration scheme provided by Midway Serverless is the same as the function part and **is cross-platform.** That is, the scheme is not limited to Aliyun or other cloud platforms, the code is consistent with the application period, and no (or little) modification is required.
- 2. The runtime adaptation capability of multiplexing functions can enjoy the same stable capability as functions. This adaptation capability is provided by Midway Serverless itself. The **code is open source, which is also convenient for troubleshooting and locating problems** or enhancing the capability.
- 3. Midway Serverless this set of capabilities is relatively common, and it is very easy to deploy privatization or **adapt to other application frameworks.**

## Some capacity constraints

- 1. The restrictions of platform gateways, such as Aliyun and Tencent cloud gateways, timeout time, POST size, file upload, etc., are the same as functions, that is, things that functions cannot do cannot be done in this application deployment scheme.
- 2. The application package deployment should not be too large. If it is relatively large, it can be solved by using the corresponding scheme of cloud platform, such as NAS of Aliyun or Layer of Tencent Cloud/AWS
- 3. The state part applied in the function container is handled by the application itself. This scheme is not responsible for solving this problem.
- 4. The application deployment model in the function container is a single process, and the stability is solved by the elastic container itself.
- 5. The part of the application that has long running or scheduled tasks will not be triggered without traffic. Please use other schemes instead.
- 6. Non-HTTP protocols such as socket in the application will not take effect
