import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadModule } from '../../src/util';

describe('loadModule with CommonJS', () => {
  let fixtureDir: string;
  let throwingModule: string;
  let missingModule: string;
  let originalError: Error;
  let originalStack: string;
  let warnSpy: jest.SpyInstance;

  beforeAll(() => {
    fixtureDir = mkdtempSync(join(tmpdir(), 'midway-load-module-'));
    throwingModule = join(fixtureDir, 'throwing.cjs');
    missingModule = join(fixtureDir, 'missing.cjs');

    // Reuse the same error across load attempts to check its identity and stack.
    const errorModule = join(fixtureDir, 'error.cjs');
    writeFileSync(
      errorModule,
      "module.exports = new Error('configuration initialization failed');"
    );
    writeFileSync(throwingModule, "throw require('./error.cjs');");
    originalError = require(errorModule);
    originalStack = originalError.stack;

    const fallbackDir = join(
      fixtureDir,
      'node_modules',
      'midway-load-module-fallback'
    );
    mkdirSync(fallbackDir, { recursive: true });
    writeFileSync(
      join(fallbackDir, 'index.js'),
      "module.exports = { loadedFrom: 'extraModuleRoot' };"
    );
  });

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  afterAll(() => {
    rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('should reject with the original runtime error by default', async () => {
    await expect(loadModule(throwingModule)).rejects.toBe(originalError);
    expect(originalError.stack).toBe(originalStack);
  });

  it('should reject with the original runtime error when safeLoad is false', async () => {
    await expect(
      loadModule(throwingModule, { loadMode: 'commonjs', safeLoad: false })
    ).rejects.toBe(originalError);
    expect(originalError.stack).toBe(originalStack);
  });

  it('should warn with the original error and stack when safe loading fails', async () => {
    await expect(
      loadModule(throwingModule, { safeLoad: true, warnOnLoadError: true })
    ).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toBe(originalError);
    expect(warnSpy.mock.calls[0][0].stack).toBe(originalStack);
  });

  it('should suppress runtime errors when safe loading without warnings', async () => {
    await expect(
      loadModule(throwingModule, { safeLoad: true })
    ).resolves.toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should still load a module from an extra module root', async () => {
    await expect(
      loadModule('midway-load-module-fallback', {
        extraModuleRoot: [fixtureDir],
      })
    ).resolves.toEqual({ loadedFrom: 'extraModuleRoot' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should reject with MODULE_NOT_FOUND when a module is missing', async () => {
    await expect(loadModule(missingModule)).rejects.toMatchObject({
      code: 'MODULE_NOT_FOUND',
    });
  });

  it.each([false, true])(
    'should silently skip missing modules with safeLoad and warnOnLoadError=%s',
    async warnOnLoadError => {
      await expect(
        loadModule(missingModule, { safeLoad: true, warnOnLoadError })
      ).resolves.toBeUndefined();
      expect(warnSpy).not.toHaveBeenCalled();
    }
  );
});
