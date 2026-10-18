import {
  CreateClientOptions,
  CreateManifestClientOptions,
  createClient,
} from '../src';

const manifest = [
  {
    operationId: 'getUser',
    method: 'get',
    path: '/:id',
    fullPath: '/users/:id',
  },
  {
    operationId: 'listUsers',
    method: 'get',
    path: '/',
    fullPath: '/users',
  },
] as const;

function checkManifestArrayNarrowing() {
  const client = createClient({ manifest });
  client.call('getUser', {});
  client.call('listUsers', {});

  // @ts-expect-error operationId must come from the manifest
  client.call('getUsers', {});

  return client;
}

function checkInlineManifestNarrowing() {
  const client = createClient({
    manifest: [
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
    ],
  });
  client.call('getUser', {});

  // @ts-expect-error operationId must come from the manifest
  client.call('listUsers', {});

  return client;
}

function checkManifestPromiseNarrowing() {
  // keep its literal types in the Promise.resolve.
  const client = createClient({
    manifest: Promise.resolve([
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
    ] as const),
  });
  client.call('getUser', {});

  // @ts-expect-error operationId must come from the manifest
  client.call('getUsers', {});

  return client;
}

function checkManifestLoaderNarrowing() {
  const client = createClient({
    manifest: () => [
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
    ],
  });
  client.call('getUser', {});

  // @ts-expect-error operationId must come from the manifest
  client.call('getUsers', {});

  return client;
}

function checkAsyncManifestLoaderNarrowing() {
  const client = createClient({
    manifest: async () => [
      {
        operationId: 'listUsers',
        method: 'get',
        path: '/',
        fullPath: '/users',
      },
    ],
  });
  client.call('listUsers', {});

  // @ts-expect-error operationId must come from the manifest
  client.call('getUsers', {});

  return client;
}

function checkManifestUrlFallback() {
  const client = createClient({ manifest: '/api/route-manifest.json' });
  client.call('getUser', {});
  client.call('anyOperationId', {});

  return client;
}

function checkClientOptionsDeclarations() {
  const arrayOptions: CreateClientOptions = { manifest };
  const promiseOptions: CreateClientOptions = {
    manifest: Promise.resolve(manifest),
  };
  const loaderOptions: CreateClientOptions = { manifest: () => manifest };
  const urlOptions: CreateClientOptions = {
    manifest: '/api/route-manifest.json',
  };
  const disabledOptions: CreateClientOptions = { manifest: false };

  return [
    arrayOptions,
    promiseOptions,
    loaderOptions,
    urlOptions,
    disabledOptions,
  ];
}

function checkManifestClientOptionsDeclarations() {
  const arrayOptions: CreateManifestClientOptions = { manifest };
  const promiseOptions: CreateManifestClientOptions = {
    manifest: Promise.resolve(manifest),
  };
  const loaderOptions: CreateManifestClientOptions = {
    manifest: () => manifest,
  };

  // @ts-expect-error manifest is required for a manifest client
  const missingOptions: CreateManifestClientOptions = {};

  return [arrayOptions, promiseOptions, loaderOptions, missingOptions];
}

const getUserRoute = {
  method: 'get',
  path: '/:id',
  options: {},
  handle: async (args: { input: { query: { id: number } }; ctx: unknown }) => {
    return { id: args.input.query.id };
  },
};

const listUsersRoute = {
  method: 'get',
  path: '/',
  options: {},
  handle: async () => {
    return [{ id: 1 }];
  },
};

function checkModuleClientTypes() {
  const client = createClient({
    user: {
      getUser: getUserRoute,
      listUsers: listUsersRoute,
    },
  });

  const user: Promise<{ id: number }> = client.user.getUser({
    query: { id: 1 },
  });
  client.user.listUsers();

  // @ts-expect-error input.args is required for a route with non-optional input
  client.user.getUser();
  // @ts-expect-error query.id must be a number
  client.user.getUser({ query: { id: '1' } });

  return user;
}

function checkModuleClientManifestNarrowing() {
  const client = createClient(
    {
      user: {
        getUser: getUserRoute,
      },
    },
    { manifest }
  );

  client.call('getUser', {});
  // @ts-expect-error operationId must come from the manifest
  client.call('getUsers', {});

  return client;
}

function checkModuleClientLoaderNarrowing() {
  const client = createClient(
    {
      user: {
        getUser: getUserRoute,
      },
    },
    {
      manifest: () => [
        {
          operationId: 'getUser',
          method: 'get',
          path: '/:id',
          fullPath: '/users/:id',
        },
      ],
    }
  );

  client.call('getUser', {});
  // @ts-expect-error operationId must come from the manifest
  client.call('getUsers', {});

  return client;
}

function checkDeclaredOptionsClient() {
  const options: CreateClientOptions = { manifest };
  const client = createClient(
    {
      user: {
        getUser: getUserRoute,
      },
    },
    options
  );

  client.call('getUser', {});
  client.call('anyOperationId', {});

  return client;
}

describe('api bridge client types', () => {
  it('should narrow operationId from every manifest source form', () => {
    expect(typeof checkManifestArrayNarrowing).toBe('function');
    expect(typeof checkInlineManifestNarrowing).toBe('function');
    expect(typeof checkManifestPromiseNarrowing).toBe('function');
    expect(typeof checkManifestLoaderNarrowing).toBe('function');
    expect(typeof checkAsyncManifestLoaderNarrowing).toBe('function');
  });

  it('should keep operationId as string for url manifest sources', () => {
    expect(typeof checkManifestUrlFallback).toBe('function');
  });

  it('should keep existing CreateClientOptions declarations assignable', () => {
    expect(typeof checkClientOptionsDeclarations).toBe('function');
    expect(typeof checkManifestClientOptionsDeclarations).toBe('function');
    expect(typeof checkDeclaredOptionsClient).toBe('function');
  });

  it('should derive module client methods from route handlers', () => {
    expect(typeof checkModuleClientTypes).toBe('function');
  });

  it('should narrow operationId for module clients with a manifest', () => {
    expect(typeof checkModuleClientManifestNarrowing).toBe('function');
    expect(typeof checkModuleClientLoaderNarrowing).toBe('function');
  });
});
