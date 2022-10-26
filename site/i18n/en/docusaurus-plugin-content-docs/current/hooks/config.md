# Project configuration

You can configure the project by using the `midway.config.ts` parameter in the root directory of the project.

> If it is a pure interface project, because the configuration needs to be read in the build environment, please use the JavaScript, the configuration file name is `midway.config.js`

## source: string

Configure the backend root directory. Default value: `./src` for pure service interfaces. Default value: `./src/api` for full-stack applications.

## routes: RouteConfig []

Enable file system routing and configuration, the default is `undefined`. For more information about the format, see [Simple Mode & File System Routing](./file-route).

## dev.ignorePattern: IgnorePattern

When configuring a full stack application, which requests developed locally should be ignored and not processed by the server.

## build.outDir: string

Configure the output directory of the full stack application. Default value: `./dist`.

## vite: ViteConfig

`Import {defineConfig} from' @midwayjs/hooks-kit '`only.

Configure Vite for full-stack applications. For more information, see [Vite](https://vitejs.dev/config/).

Examples:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from '@midwayjs/hooks-kit';

export default defineConfig({
  vite: {
    plugins: [react()]
  },
});
```
