# Deployment

Midway Hooks supports Api Server and integration.

## Api Server deployment

For more information about how to deploy Api Server, see [Start and deploy Api Server](https://midwayjs.org/docs/deployment).

If you use a single file deployment, you can refer to the example: [hooks-api-bundle-starter](https://github.com/midwayjs/hooks/blob/main/examples/api-bundle/readme.md)

## Integrated deployment

The integrated construction product includes the front and back ends, which can be divided into the following categories according to the difficulty of deployment.

- The front and back ends are deployed on the same server, and the back end hosts HTML & static resources & provides interfaces
- Static resources are deployed to CDN, backend hosting HTML & providing interfaces
- Static resources are deployed to CDN,HTML is hosted by a separate service (CDN / Nginx / etc.), and the backend only provides interfaces.

Next, I will introduce how the three deployment modes land, their advantages and existing problems.

### The front and back ends are deployed on the same server

This is the default deployment mode for full stack suites.

Advantages: The simplest, upload the packaged product directly to the server, and provide services after startup
Weaknesses:

- Backend services need to process & send files
- Static resources are not located in CDN, and the access speed of different regions is unstable.

The overall deployment architecture is shown in the figure:

![](https://img.alicdn.com/imgextra/i1/O1CN01GYtN9n1T2tbEXWOwf_!!6000000002325-2-tps-2064-648.png)

### Static resources are deployed to CDN, backend hosting HTML & providing interfaces

This is also the current front-end mainstream deployment mode.

Advantages:

- Static resources are hosted by CDN to ensure user access speed.
- The back end hosts HTML to ensure that the returned HTML file is up to date

Weaknesses:

- The backend still needs to host HTML, still needs to process & send files, and the page cannot be accessed if the service goes down.

The overall access architecture is shown in the figure:

![](https://img.alicdn.com/imgextra/i4/O1CN01ue3LJg1HeernvfxgQ_!!6000000000783-55-tps-267-367.svg)

#### Specify a static resource public domain name

You can specify the public domain name of static resources by setting the `site. base` option in `midway.config.ts`.

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from '@midwayjs/hooks-kit';

export default defineConfig({
  vite: {
    plugins: [react()]
    base: 'https://cdn.example.com',
  },
});
```

When accessing the page, the static resource will point to the address of the CDN.

#### Deploy static files

In a full stack suite project, the default build directory is dist, where `dist/_clients` is the frontend static resource directory.

As follows:

```
dist
├── _client
│   ├── assets
│   │   ├── index.85bb4f15.js
│   │   ├── index.b779b14d.css
│   │   └── vendor.346bc0da.js
│   ├── index.html
│   ├── logo.png
│   └── manifest.json
├── _serve
│   └── index.js
├── book.js
├── configuration.js
├── date.js
├── midway.config.js
└── star.js
```

You need to upload the files in the `_client` directory to CDN. However, when you deploy the backend, the `_client/index.html` file is retained for backend hosting.

### Static resources are deployed to CDN,HTML is hosted by a separate service (CDN / Nginx / etc.), and the backend only provides interfaces.

This is also the current mainstream deployment mode of the front end.

Advantages:

- The backend only provides API interfaces and does not need to process & send files
- Static resources are hosted by CDN to ensure user access speed.
- HTML is hosted by a separate service, ensuring that the access page is the latest version, and the backend service downtime does not affect the page display.
- The architecture can be expanded to add more nodes to cope with unexpected situations, such as adding gateway nodes in front of the back-end, switching to standby services when the back-end service is down, etc.

Weaknesses:

- Complex, high requirements for CI / CD assembly line and infrastructure.

The overall access architecture is shown in the figure

![](https://img.alicdn.com/imgextra/i1/O1CN01i78JiC1yinvfLq84b_!!6000000006613-55-tps-323-367.svg)

The deployment workflow is as follows:

![](https://img.alicdn.com/imgextra/i2/O1CN018oAQf71h1QxHtRHYY_!!6000000004217-2-tps-1728-1680.png)

#### Full stack suite deployment guide

The index.html hosting capability of the full-stack kit needs to be disabled by default. In this case, the full-stack kit will not generate the hosting function of `index.html` during construction, and only provide Api services.

```ts
import { defineConfig } from '@midwayjs/hooks-kit';

export default defineConfig({
  static: false,
});
```

In your CI / CD workflow, the following files need to be processed separately.

- index.html: Deploy to a separate managed service, such as Nginx / CDN, which is only responsible for static page rendering.
- Static resources: Deploy to CDN, such as Aliyun OSS. This service can provide CDN acceleration for static resources.
- Api service: deploy to your server

The final domain name may be as follows:

- Index.html: https://example.com
- Static resources: https://cdn.example.com
- Api service: https://api.example.com or https://example.com/api (reverse proxy needs to be set)
