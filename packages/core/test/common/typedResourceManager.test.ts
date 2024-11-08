import { TypedResourceManager } from '../../src';

describe('test/common/typedResourceManager.test.ts', () => {
  let typedResourceManager: TypedResourceManager<any, any, any>;
  let mockResourceInitialize: jest.Mock;
  let mockResourceBinding: jest.Mock;
  let mockResourceStart: jest.Mock;
  let mockResourceDestroy: jest.Mock;

  beforeEach(() => {
    mockResourceInitialize = jest.fn().mockResolvedValue('mockResource');
    mockResourceBinding = jest.fn().mockResolvedValue('mockBindingResult');
    mockResourceStart = jest.fn().mockResolvedValue(undefined);
    mockResourceDestroy = jest.fn().mockResolvedValue(undefined);

    typedResourceManager = new TypedResourceManager({
      initializeValue: {
        testResource: { configKey: 'configValue' }
      },
      initializeClzProvider: {
        testResource: class {}
      },
      resourceInitialize: mockResourceInitialize,
      resourceBinding: mockResourceBinding,
      resourceStart: mockResourceStart,
      resourceDestroy: mockResourceDestroy
    });
  });

  it('should create and initialize resources', async () => {
    await typedResourceManager.init();
    expect(mockResourceInitialize).toHaveBeenCalledWith({ configKey: 'configValue' }, 'testResource');
    expect(mockResourceBinding).toHaveBeenCalledWith(expect.any(Function), { configKey: 'configValue' }, 'mockResource', 'testResource');
  });

  it('should start resources', async () => {
    await typedResourceManager.init();
    await typedResourceManager.start();
    expect(mockResourceStart).toHaveBeenCalledWith('mockResource', { configKey: 'configValue' }, 'mockBindingResult');
  });

  it('should destroy resources', async () => {
    await typedResourceManager.init();
    await typedResourceManager.destroy();
    expect(mockResourceDestroy).toHaveBeenCalledWith('mockResource', { configKey: 'configValue' });
  });

  it('should start resources in parallel', async () => {
    await typedResourceManager.init();
    await typedResourceManager.startParallel();
    expect(mockResourceStart).toHaveBeenCalledWith('mockResource', { configKey: 'configValue' }, 'mockBindingResult');
  });

  it('should destroy resources in parallel', async () => {
    await typedResourceManager.init();
    await typedResourceManager.destroyParallel();
    expect(mockResourceDestroy).toHaveBeenCalledWith('mockResource', { configKey: 'configValue' });
  });

  it('should get a resource by name', async () => {
    await typedResourceManager.init();
    const resource = typedResourceManager.getResource('testResource');
    expect(resource).toBe('mockResource');
  });
});
