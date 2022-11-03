import {
  getCurrentMainApp,
  IMidwayApplication,
  IMidwayContext,
  MidwayMockService,
} from '@midwayjs/core';

function getMockService(app?): MidwayMockService {
  if (!app) {
    app = getCurrentMainApp();
  }
  if (!app) {
    return null;
  }
  if (!app.getApplicationContext) {
    throw new Error('[mock]: app.getApplicationContext is undefined.');
  }

  const applicationContext = app.getApplicationContext();
  const mockService = applicationContext.get(MidwayMockService);
  if (!mockService) {
    throw new Error('[mock]: MidwayMockService is undefined.');
  }
  return mockService;
}

export function mockSession(
  app: IMidwayApplication<any>,
  key: string,
  value: any
) {
  const mockService = getMockService(app);
  mockService.mockContext(app, (ctx: any) => {
    if (!ctx.session) {
      ctx.session = {};
    }
    ctx.session[key] = value;
  });
}

export function mockHeader(
  app: IMidwayApplication<any>,
  headerKey: string,
  headerValue: string
) {
  const mockService = getMockService(app);
  mockService.mockContext(app, (ctx: any) => {
    ctx.headers[headerKey] = headerValue;
  });
}

export function mockClassProperty(
  clzz: new (...args) => any,
  propertyName: string,
  value: any
) {
  const mockService = getMockService();
  if (!mockService) {
    return MidwayMockService.mockClassProperty(clzz, propertyName, value);
  } else {
    return mockService.mockClassProperty(clzz, propertyName, value);
  }
}

export function mockProperty(obj: any, key: string, value) {
  const mockService = getMockService();
  if (!mockService) {
    return MidwayMockService.mockProperty(obj, key, value);
  } else {
    return mockService.mockProperty(obj, key, value);
  }
}

export function restoreAllMocks() {
  const mockService = getMockService();
  if (mockService) {
    mockService.restore();
  } else {
    MidwayMockService.prepareMocks = [];
  }
}

export function mockContext(
  app: IMidwayApplication<any>,
  key: string | ((ctx: IMidwayContext) => void),
  value?: PropertyDescriptor | any
) {
  const mockService = getMockService(app);
  mockService.mockContext(app, key, value);
}
