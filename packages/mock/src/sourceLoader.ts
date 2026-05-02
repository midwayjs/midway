import { loadModule, ModuleLoader, ModuleLoadOptions } from '@midwayjs/core';
import { dirname, join, relative, resolve, sep } from 'path';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { debuglog } from 'util';
import { pathToFileURL } from 'url';
import * as crypto from 'crypto';

const debug = debuglog('midway:debug');

let cachedTypeScriptCompiler: any;

function resolveRelativeEsmSpecifierPath(
  importerFile: string,
  specifier: string
): string | undefined {
  if (
    !specifier ||
    (!specifier.startsWith('./') && !specifier.startsWith('../'))
  ) {
    return undefined;
  }

  const absolute = resolve(dirname(importerFile), specifier);
  const candidates: string[] = [absolute];

  if (/\.(mjs|cjs|js)$/i.test(specifier)) {
    candidates.push(
      absolute.replace(/\.(mjs|cjs|js)$/i, '.mts'),
      absolute.replace(/\.(mjs|cjs|js)$/i, '.cts'),
      absolute.replace(/\.(mjs|cjs|js)$/i, '.ts'),
      absolute.replace(/\.(mjs|cjs|js)$/i, '.tsx')
    );
  } else if (!/\.[a-z0-9]+$/i.test(specifier)) {
    candidates.push(
      `${absolute}.mts`,
      `${absolute}.cts`,
      `${absolute}.ts`,
      `${absolute}.tsx`,
      `${absolute}.mjs`,
      `${absolute}.cjs`,
      `${absolute}.js`,
      `${absolute}.json`,
      join(absolute, 'index.mts'),
      join(absolute, 'index.cts'),
      join(absolute, 'index.ts'),
      join(absolute, 'index.tsx'),
      join(absolute, 'index.mjs'),
      join(absolute, 'index.cjs'),
      join(absolute, 'index.js'),
      join(absolute, 'index.json')
    );
  }

  for (const item of candidates) {
    if (existsSync(item)) {
      return item;
    }
  }

  return undefined;
}

function shouldUseEsmSourceFallback(
  originErr: any,
  filePath: string,
  rewritten: string,
  source: string
) {
  if (rewritten !== source) {
    return true;
  }

  if (!/\.(mts|cts|ts|tsx)$/i.test(filePath)) {
    return false;
  }

  return (
    originErr?.code === 'ERR_UNKNOWN_FILE_EXTENSION' ||
    originErr instanceof SyntaxError ||
    originErr?.name === 'SyntaxError'
  );
}

function formatFallbackImportSpecifier(fromFile: string, toFile: string) {
  let specifier = relative(dirname(fromFile), toFile).split(sep).join('/');
  if (!specifier.startsWith('.')) {
    specifier = `./${specifier}`;
  }
  return specifier;
}

function loadTypeScriptCompiler(sourceFile: string) {
  if (cachedTypeScriptCompiler) {
    return cachedTypeScriptCompiler;
  }

  const searchPaths = [dirname(sourceFile), process.cwd(), __dirname];
  for (const item of searchPaths) {
    try {
      cachedTypeScriptCompiler = require(
        require.resolve('typescript', {
          paths: [item],
        })
      );
      return cachedTypeScriptCompiler;
    } catch {
      // try next path
    }
  }
}

function createCompiledEsmFallbackGraph(entryFile: string) {
  const tempDir = mkdtempSync(
    join(dirname(entryFile), '.midway-esm-fallback-')
  );
  const compiledFileMap = new Map<string, string>();
  const tsCompiler = loadTypeScriptCompiler(entryFile);

  const compileFile = (sourceFile: string): string => {
    const existed = compiledFileMap.get(sourceFile);
    if (existed) {
      return existed;
    }

    const compiledFile = join(
      tempDir,
      `${crypto.createHash('sha1').update(sourceFile).digest('hex')}.mjs`
    );
    compiledFileMap.set(sourceFile, compiledFile);

    if (sourceFile.endsWith('.json')) {
      const jsonSource = readFileSync(sourceFile, { encoding: 'utf-8' });
      writeFileSync(compiledFile, `export default ${jsonSource};`, {
        encoding: 'utf-8',
      });
      return compiledFile;
    }

    const source = readFileSync(sourceFile, { encoding: 'utf-8' });
    const rewriteByPattern = (pattern: RegExp, input: string) => {
      return input.replace(pattern, (full, head, spec, tail) => {
        const resolved = resolveRelativeEsmSpecifierPath(sourceFile, spec);
        if (!resolved) {
          return full;
        }
        const compiledDependency = compileFile(resolved);
        const fallbackSpecifier = formatFallbackImportSpecifier(
          compiledFile,
          compiledDependency
        );
        return `${head}${fallbackSpecifier}${tail}`;
      });
    };

    let rewritten = source;
    rewritten = rewriteByPattern(/(from\s+['"])([^'"]+)(['"])/g, rewritten);
    rewritten = rewriteByPattern(
      /(import\s*\(\s*['"])([^'"]+)(['"]\s*\))/g,
      rewritten
    );

    let output = rewritten;
    if (/\.(mts|cts|ts|tsx)$/i.test(sourceFile)) {
      if (!tsCompiler) {
        throw new Error(
          `[mock]: can not transpile esm typescript file "${sourceFile}", please install "typescript" in current project`
        );
      }

      output = tsCompiler.transpileModule(rewritten, {
        fileName: sourceFile,
        compilerOptions: {
          module: tsCompiler.ModuleKind.ESNext,
          target: tsCompiler.ScriptTarget.ES2020,
          moduleResolution: tsCompiler.ModuleResolutionKind.NodeNext,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          resolveJsonModule: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          useDefineForClassFields: false,
          jsx: tsCompiler.JsxEmit.ReactJSX,
        },
      }).outputText;
    }

    writeFileSync(compiledFile, output, { encoding: 'utf-8' });
    return compiledFile;
  };

  return {
    entryFile: compileFile(entryFile),
    cleanup() {
      rmSync(tempDir, {
        recursive: true,
        force: true,
      });
    },
  };
}

function rewriteRelativeEsmSource(
  importerFile: string,
  source: string
): string {
  let changed = false;
  const rewriteByPattern = (pattern: RegExp, input: string) => {
    return input.replace(pattern, (full, head, spec, tail) => {
      const resolved = resolveRelativeEsmSpecifierPath(importerFile, spec);
      if (!resolved) {
        return full;
      }

      let fallback = relative(dirname(importerFile), resolved)
        .split(sep)
        .join('/');
      if (!fallback.startsWith('.')) {
        fallback = `./${fallback}`;
      }

      if (fallback === spec) {
        return full;
      }

      changed = true;
      return `${head}${fallback}${tail}`;
    });
  };

  let output = source;
  output = rewriteByPattern(/(from\s+['"])([^'"]+)(['"])/g, output);
  output = rewriteByPattern(/(import\s*\(\s*['"])([^'"]+)(['"]\s*\))/g, output);
  return changed ? output : source;
}

async function importWithSpecifierFallback(p: string, importQuery?: string) {
  const fileUrl = pathToFileURL(p);
  if (importQuery) {
    fileUrl.searchParams.set('mwImportQuery', importQuery);
  }

  try {
    return await import(fileUrl.href);
  } catch (originErr) {
    const source = readFileSync(p, { encoding: 'utf-8' });
    const rewritten = rewriteRelativeEsmSource(p, source);
    if (!shouldUseEsmSourceFallback(originErr, p, rewritten, source)) {
      throw originErr;
    }

    const fallbackGraph = createCompiledEsmFallbackGraph(p);
    try {
      const fallbackUrl = pathToFileURL(fallbackGraph.entryFile);
      if (importQuery) {
        fallbackUrl.searchParams.set('mwImportQuery', importQuery);
      }
      return await import(fallbackUrl.href);
    } finally {
      fallbackGraph.cleanup();
    }
  }
}

export function createSourceModuleLoader(
  baseLoader: ModuleLoader = loadModule
): ModuleLoader {
  return async (p: string, options: ModuleLoadOptions = {}) => {
    options.enableCache = options.enableCache ?? true;
    options.safeLoad = options.safeLoad ?? false;
    options.loadMode = options.loadMode ?? 'commonjs';

    if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
      p = resolve(dirname(module.parent.filename), p);
    }

    debug(
      `[mock]: source load module ${p}, cache: ${options.enableCache}, mode: ${options.loadMode}, safeLoad: ${options.safeLoad}`
    );

    try {
      if (
        options.enableCache &&
        options.loadMode === 'esm' &&
        !p.endsWith('.json')
      ) {
        try {
          return await baseLoader(p, {
            ...options,
            safeLoad: false,
          });
        } catch {
          // Mock dev mode loads TS source files directly. This fallback stays in
          // mock on purpose so core.loadModule() can remain a plain loader.
          return await importWithSpecifierFallback(p, options.importQuery);
        }
      }

      return await baseLoader(p, {
        ...options,
        safeLoad: false,
      });
    } catch (err) {
      if (!options.safeLoad) {
        throw err;
      }

      if (
        options.warnOnLoadError &&
        err.code !== 'MODULE_NOT_FOUND' &&
        err.code !== 'ERR_MODULE_NOT_FOUND' &&
        err.code !== 'ENOENT'
      ) {
        console.warn(err);
      }
      debug(`[mock]: SafeLoadModule Warning\n\n${err.message}\n`);
      return undefined;
    }
  };
}
