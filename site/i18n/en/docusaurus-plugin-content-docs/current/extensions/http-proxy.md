# HTTP proxy

The HTTP request proxy component is applicable to multiple frameworks such as `@midwayjs/faas`, `@midwayjs/web`, `@midwayjs/koa`, and `@midwayjs/express`. It supports multiple request methods such as GET and POST.

Related information:

| Web support |     |
| ----------------- | --- |
| @midwayjs/koa | ✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web | ✅ |
| @midwayjs/express | ✅ |

## Installation dependency

```bash
$ npm i @midwayjs/http-proxy@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/http-proxy": "^3.0.0"
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```

## Enable components

Introduce components in `src/configuration.ts`

```typescript
// ...
import * as proxy from '@midwayjs/http-proxy';

@Configuration({
  imports: [
    // ...other components
    proxy,
  ],
})
export class MainConfiguration {}
```

## Configuration

The proxy configuration is defined as follows:

```typescript
// proxy configuration type
export interface HttpProxyConfig {
  // Match the URL regular expression to be represented
  match: RegExp;
  // Replace the host of the matching link and proxy the request to this address.
  host?: string;
  // Capture group processing proxy addresses through regular expressions
  target?: string;
  // The timeout time of the forwarding request. The default time is 0. No timeout time is set.
  proxyTimeout?: number;
  // Ignore the fields in the header forwarded by the proxy request
  ignoreHeaders ?: {
    [key: string]: boolean;
  };
}
```

Agents support a single agent and multiple agents.

Single proxy configuration

```typescript
// src/config/config.default.ts

export default {
  httpProxy: {
    match: /\/tfs \//,
    host: 'https://gw.alicdn.com',
  },
};
```

Multiple agent configurations

```typescript
// src/config/config.default.ts

// Proxy configuration type
export default {
  default: {
    // Some multiplexed values for each policy will be merged with the following policies.
  },
  strategy: {
    gw: {
      // https://gw.alicdn.com/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png
      match: /\/tfs \//,
      host: 'https://gw.alicdn.com',
    },
    g: {
      // https://g.alicdn.com/mtb/lib-mtop/2.6.1/mtop.js
      match: /\/bdimg\/(.*)$ /,
      target: 'https://sm.bdimg.com/$1',
    },
    httpBin: {
      // https://httpbin.org/
      match: /\/httpbin\/(.*)$ /,
      target: 'https://httpbin.org/$1',
    },
  },
};
```

## Example: Configuring Agents Using host

```typescript
export default {
  httpProxy: {
    match: /\/tfs \//,
    host: 'https://gw.alicdn.com',
  },
};
```

If the request is `https:// yourdomain.com/tfs/test.png`, the regular expression configured in the `match` field is successfully matched, and the `https:// yourdomain.com` part of the `host` in the original request path is replaced with the configured `https:// gw.alicdn.com`, thus initiating a proxy request to `https:// gw.alicdn.com/tfs/test.png` and return the response to the user requesting your site.

## Example: Configuring Agents Using target

```typescript
export default {
  httpProxy: {
    match: /\/httpbin\/(.*)$ /,
    target: 'https://httpbin.org/$1',
  },
};
```

When requesting that your site path is: `https:// yourdomain.com/httpbin/get? When name is set to midway`, the regular expression configured in the `match` field is matched, and the regular capture group has the result `['get?name = midway']`, replace the `$1` part of the original request path with the `get? of the first data (index: 0) in the capture group? name = midway` to initiate a proxy request to `https:// httpbin.org/get? Name = midway` and return the response to the user requesting your site.
