# Tencent Cloud releases FAQ

## User authentication

When Tencent Cloud is deployed, if it is the first deployment, the console will display the corresponding two-dimensional code, and the authentication can be completed by scanning the code. The configuration will be reused by default for a single project.

The authentication file is stored in the `.env` file in the root directory of the deployment. If you want to modify the file, you can delete the file and scan the code again.

You can also modify the content in the following format:

```
TENCENT_APP_ID = xxxxxx# AppId of authorized account
TENCENT_SECRET_ID = xxxxxx# SecretId of authorized account
TENCENT_SECRET_KEY = xxxxxx# SecretKey of authorized account
TENCENT_TOKEN = xxxxx# temporary token
```

If you want to use a RAM user to publish a RAM user, you can view the [RAM user permissions](https://cloud.tencent.com/document/product/1154/43006).



## Publishing area switching

Tencent cloud configuration supports publishing to different regions.

```yaml
service: fc-qinyue-test

provider:
  name: tencent
  runtime: nodejs10
  region: ap-shanghai
```

Common region values are:

- ap-shanghai Shanghai
- ap-guangzhou Guangzhou
- ap-beijing Beijing
- ap-hongkong Hong Kong



For the complete list of regions, see [Tencent Cloud documentation](https://cloud.tencent.com/document/api/583/17238).



## Reuse API Gateway

If the HTTP function is officially released, Tencent Cloud will automatically create a serviceId that identifies the Gateway every time it is released, and there will be many in the long run. In order to reuse each time, it is better to record the serviceId to reuse the following codes after the first release (or apply for a good gateway in advance).

```yaml
service: fc-qinyue-test

provider:
  name: tencent
  runtime: nodejs10
  serviceId: service-xxxxxx # <---- fill in the id here for reuse
```

**Obtain the ID of the API Gateway**

Way one, get from the platform.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752561344-c520ce4d-8dba-4e88-99c6-744e5af73cb9.png#height=577&id=nPqm4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=577&originWidth=1173&originalType=binary&size=72901&status=done&style=none&width=1173" width="1173" />

Method 2, get after each release.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752629863-178fd9db-7dcb-496e-af05-1fc68abfb30f.png#height=115&id=iBgEU&margin=%5Bobject%20Object%5D&name=image.png&originHeight=115&originWidth=746&originalType=binary&size=39588&status=done&style=none&width=746" width="746" />

## Bind domain name

After Tencent Cloud is released, it automatically gives a gateway address to access cloud functions, such as `http:// service-xxxxx-xxxxxxxx.gz.apigw.tencentcs.com:80`. At the same time, it automatically maps three sets of environment names and loads them on the path.

- Test environment/test
- Advance/prepub
- Online/release

This address can be seen at both the trigger management of the function and the API gateway.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752924557-d0eb153e-f583-49c2-b9a4-55e417867b43.png#height=421&id=cPfTl&margin=%5Bobject%20Object%5D&name=image.png&originHeight=578&originWidth=1025&originalType=binary&size=49631&status=done&style=none&width=746" width="746" />

at the gateway.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752972052-c2f7fbc8-0725-49e0-ab73-5dec6a7c0c00.png#height=732&id=Qw18W&margin=%5Bobject%20Object%5D&name=image.png&originHeight=732&originWidth=3010&originalType=binary&size=238685&status=done&style=none&width=3010" width="3010" />

If we want to remove this environment, we have to bind a custom domain name.

Click "New" at the custom domain name of API Gateway ".

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753063041-496d876f-3457-47cb-8156-c9e8364e91db.png#height=338&id=mIiB5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=338&originWidth=1096&originalType=binary&size=26777&status=done&style=none&width=1096" width="1096" />

Configure a custom path mapping, such as mapping`/`to the official publishing environment, so that the environment suffix is not required when accessing by a domain name.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753124170-9e6a2b01-dad8-47df-9d81-294d8397137b.png#height=607&id=FAbTy&margin=%5Bobject%20Object%5D&name=image.png&originHeight=607&originWidth=904&originalType=binary&size=49449&status=done&style=none&width=904" width="904" />

## Additional billing

When using local tools, due to the SDK provided by Tencent Cloud, a COS Bucket may be created for the storage of code packages. As COS is used for payment, a certain fee will be incurred. Please pay attention to your COS situation in time to avoid deduction.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1606803155279-51e71ffa-6e9a-4ab9-812b-19003d45483c.png#height=460&id=DRD5n&margin=%5Bobject%20Object%5D&name=image.png&originHeight=460&originWidth=1196&originalType=binary&size=60856&status=done&style=none&width=1196" width="1196" />

## **Delete Tencent Gateway**

After trying out the Tencent cloud service for a period of time, many examples of non-reused gateways will appear because API gateways are not reused every time, as follows.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749300990-34089754-5fe2-4fb9-942a-0f9f0abc6984.png#height=1226&id=Jo9cX&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1226&originWidth=2778&originalType=binary&size=261243&status=done&style=none&width=2778" width="2778" />

At this time, because the gateway has bound functions, the delete button is gray, and we need to manually delete the resources one by one.

Enter an API gateway instance first.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749368951-da40aa66-249f-46ac-b208-e7085952c528.png#height=361&id=fA0yx&margin=%5Bobject%20Object%5D&name=image.png&originHeight=942&originWidth=1946&originalType=binary&size=134710&status=done&style=none&width=746" width="746" />

Enter the management API and delete the general API below.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749549259-fd35cfa1-9e00-42a3-82ff-78f3de23dd85.png#height=930&id=iTseJ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=930&originWidth=2346&originalType=binary&size=122962&status=done&style=none&width=2346" width="2346" />

Go to environmental management and take the environment offline.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749641386-77ddf012-2b29-46a5-a8dc-6d416d07518e.png#height=770&id=lAclZ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=770&originWidth=2234&originalType=binary&size=134714&status=done&style=none&width=2234" width="2234" />

Go back to the initial list and click Delete.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749709595-1c47d6e3-08af-42e1-be34-961409f82e1a.png#height=986&id=ZpugG&margin=%5Bobject%20Object%5D&name=image.png&originHeight=986&originWidth=2342&originalType=binary&size=182531&status=done&style=none&width=2342" width="2342" />
