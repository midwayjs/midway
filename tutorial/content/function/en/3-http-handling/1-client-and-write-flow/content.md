---
title: Client and write APIs
preview: /users
focus: /src/web/api/client.ts
routes:
  - /users
  - /users/u-1
---

# Client and write APIs

The payoff of `defineApi` is a typed client from the same contract. `createClient` turns route names into calls like `api.user.getOne({ params: { id } })` — no hand-written method/path.

```ts
import { createClient } from '@midwayjs/web-bridge';
import { userApi } from '../../server/api/user.api';

export const api = createClient(
  { user: userApi },
  { manifest: false }
);
```

`manifest: false` means "use this `defineApi` object over HTTP", without a Vite plugin generating a route manifest. The preview in this tutorial is the Midway server, not a separate frontend build.

- The server prefix is `/users`. With no `globalPrefix`, requests go to `/users/:id`
- If you later set `koa.globalPrefix` to `/api`, set the client's `basePath` to `/api` too
- `src/web/pages/user.page.ts` shows how a page would call it. In a real React/Vue app, put the same `createClient` in the Vite project

`user.api.ts` already has POST / PUT / DELETE. Create sets 201 via `useContext()`:

```ts
const ctx = useContext();
ctx.status = 201;
```

```bash
curl -X POST http://localhost:7001/users \
  -H 'content-type: application/json' \
  -d '{"name":"kate","email":"kate@example.com"}'
```
