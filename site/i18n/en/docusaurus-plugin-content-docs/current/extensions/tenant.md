# Tenant

Here's how to quickly use tenant components in Midway.

Related Information:

| Description                     |      |
| ------------------------------- | ---- |
| Available for standard projects | ✅    |
| Available for Serverless        | ✅    |
| Available for integration       | ✅    |
| Contains independent main frame | ❌    |
| Contains standalone logs        | ❌    |



## Tenant definition

Tenant management is a function often required in the middle and back-end business development process.

During development, different users need to be stored in different data sources, namespaces or areas. These different data areas are collectively called "tenants".



## Install dependencies

`@midwayjs/tenant` is the main function package.

```bash
$ npm i @midwayjs/tenant@3 --save
```

Or add the following dependencies in `package.json` and reinstall.

```json
{
   "dependencies": {
     "@midwayjs/tenant": "^3.0.0",
     // ...
   }
}
```




##Introduce components


First, introduce the component and import it in `src/configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/core';
import * as tenant from '@midwayjs/tenant';

@Configuration({
   imports: [
     // ...
     tenant,
   ],
})
export class MainConfiguration {
}
```



## Tenant information access

Different tenant data are isolated from each other. Generally speaking, each user data is associated with relevant tenant information. After the user information is obtained through user authentication, its corresponding tenant data is obtained for subsequent data reading and writing.

In Midway, tenant data can be saved in the request object ctx and can be used by all subsequent request scope objects. However, it is not enough for tenant information to be used only in the request link. It needs to be effective in different scopes, which requires a new architecture to support it.

The component provides a `TenantManager` to manage tenant information.

You need to save tenant information in each request link before retrieving it later.

The format of tenant information can be defined as required.

for example:

```typescript
interface TenantInfo {
   id: string;
   name: string;
}
```

For example, save in middleware.

```typescript
import { TenantManager } from '@midwayjs/tenant';
import { Middleware, Inject } from '@midwayjs/core';

@Middleware()
class TenantMiddleware {
   @Inject()
   tenantManager: tenant.TenantManager;

   resolve() {
     return async(ctx, next) => {
       //Set tenant information in the request link
       this.tenantManager.setCurrentTenant({
         id: '123',
         name: 'my tenant'
       });
     }
   }
}
```

Obtained in subsequent singleton services.

```typescript
import { TenantManager } from '@midwayjs/tenant';
import { Inject, Singleton } from '@midwayjs/core';
import { TenantInfo } from '../interface';

@Singleton()
class TenantService {
   @Inject()
   tenantManager: tenant.TenantManager;

   async getTenantInfo() {
     const tenantInfo = await this.tenantManager.getCurrentTenant<TenantInfo>();
     if (tenantInfo) {
       console.log(tenantInfo.name);
     // output => my tenant
     }
   }
}
```



:::tip

* 1. Tenant information will definitely be associated with the request. If necessary, you can add middleware to different Frameworks.
* 2. The tenant information saved in each request is isolated
* 3. Regardless of whether it is a singleton or a request scope, you can only obtain the tenant data corresponding to the current request.

:::