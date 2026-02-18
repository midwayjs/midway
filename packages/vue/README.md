# @midwayjs/vue

Vue-specific integration for Midway functional API.

## Install

```bash
npm i @midwayjs/vue @midwayjs/web-bridge
```

```json
{
  "dependencies": {
    "@midwayjs/vue": "^4.0.0-beta.11",
    "@midwayjs/web-bridge": "^4.0.0-beta.11"
  }
}
```

## Usage

```ts
import { createApp } from 'vue';
import { createMidwayApiPlugin } from '@midwayjs/vue';
import { api } from './api/client';
import App from './App.vue';

createApp(App).use(createMidwayApiPlugin(api)).mount('#root');
```

```ts
import { useMidwayApiOperation } from '@midwayjs/vue';

const callGetUser = useMidwayApiOperation<{ params: { id: string } }, { id: string }>('user.getUser');
await callGetUser({ params: { id: '1' } });
```
