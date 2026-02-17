import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

const VIRTUAL_PREFIX = '\0midway-api:';

type RouteContract = {
  method: string;
  path: string;
  options?: {
    routerName?: string;
    ignoreGlobalPrefix?: boolean;
  };
};

type ApiModuleContract = {
  name: string;
  prefix: string;
  controllerOptions: Record<string, unknown>;
  routes: Record<string, RouteContract>;
};

export interface ApiPluginOptions {
  root?: string;
  apiDir: string;
}

function isWord(ch: string) {
  return /[a-zA-Z0-9_$]/.test(ch);
}

function skipString(source: string, start: number) {
  const quote = source[start];
  let i = start + 1;
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2;
      continue;
    }
    if (source[i] === quote) {
      return i + 1;
    }
    i++;
  }
  return source.length;
}

function skipComment(source: string, start: number) {
  if (source[start + 1] === '/') {
    let i = start + 2;
    while (i < source.length && source[i] !== '\n') {
      i++;
    }
    return i;
  }
  if (source[start + 1] === '*') {
    let i = start + 2;
    while (i + 1 < source.length) {
      if (source[i] === '*' && source[i + 1] === '/') {
        return i + 2;
      }
      i++;
    }
    return source.length;
  }
  return start + 1;
}

function findMatching(
  source: string,
  start: number,
  openChar: string,
  closeChar: string
) {
  let depth = 1;
  let i = start + 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i);
      continue;
    }
    if (ch === '/' && (source[i + 1] === '/' || source[i + 1] === '*')) {
      i = skipComment(source, i);
      continue;
    }
    if (ch === openChar) {
      depth++;
    } else if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
    i++;
  }
  return -1;
}

function splitTopLevel(source: string, separator: string) {
  const parts: string[] = [];
  let start = 0;
  let i = 0;
  let p = 0;
  let b = 0;
  let s = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i);
      continue;
    }
    if (ch === '/' && (source[i + 1] === '/' || source[i + 1] === '*')) {
      i = skipComment(source, i);
      continue;
    }
    if (ch === '(') p++;
    if (ch === ')') p--;
    if (ch === '{') b++;
    if (ch === '}') b--;
    if (ch === '[') s++;
    if (ch === ']') s--;
    if (ch === separator && p === 0 && b === 0 && s === 0) {
      parts.push(source.slice(start, i).trim());
      start = i + 1;
    }
    i++;
  }
  const tail = source.slice(start).trim();
  if (tail) {
    parts.push(tail);
  }
  return parts;
}

function parseStringLiteral(raw: string) {
  const text = raw.trim();
  const first = text[0];
  const last = text[text.length - 1];
  if ((first === "'" || first === '"') && last === first) {
    return text.slice(1, -1);
  }
  return text;
}

function parseSimpleObject(raw: string): Record<string, unknown> {
  const text = raw.trim();
  if (!text.startsWith('{') || !text.endsWith('}')) {
    return {};
  }
  const body = text.slice(1, -1).trim();
  if (!body) {
    return {};
  }
  const result: Record<string, unknown> = {};
  for (const segment of splitTopLevel(body, ',')) {
    const idx = segment.indexOf(':');
    if (idx < 0) continue;
    const key = segment.slice(0, idx).trim().replace(/^['"]|['"]$/g, '');
    const valueRaw = segment.slice(idx + 1).trim();
    if (valueRaw === 'true' || valueRaw === 'false') {
      result[key] = valueRaw === 'true';
      continue;
    }
    if (
      (valueRaw.startsWith("'") && valueRaw.endsWith("'")) ||
      (valueRaw.startsWith('"') && valueRaw.endsWith('"'))
    ) {
      result[key] = valueRaw.slice(1, -1);
      continue;
    }
    result[key] = valueRaw;
  }
  return result;
}

function parseFactoryRoutes(factoryArg: string): Record<string, RouteContract> {
  const arrowIdx = factoryArg.indexOf('=>');
  if (arrowIdx < 0) {
    return {};
  }
  const afterArrow = factoryArg.slice(arrowIdx + 2);
  const objectStart = afterArrow.indexOf('{');
  if (objectStart < 0) {
    return {};
  }
  const absStart = arrowIdx + 2 + objectStart;
  const absEnd = findMatching(factoryArg, absStart, '{', '}');
  if (absEnd < 0) {
    return {};
  }
  const objectBody = factoryArg.slice(absStart + 1, absEnd);
  const routes: Record<string, RouteContract> = {};
  for (const segment of splitTopLevel(objectBody, ',')) {
    const idx = segment.indexOf(':');
    if (idx < 0) continue;
    const routeKey = segment.slice(0, idx).trim();
    const routeValue = segment.slice(idx + 1).trim();
    const m = routeValue.match(
      /api\s*\.\s*(get|post|put|delete|patch|options|head|all)\s*\(([\s\S]*?)\)/
    );
    if (!m) {
      continue;
    }
    const method = m[1];
    const pathRaw = m[2]?.trim() || "'/'";
    const metaMatch = routeValue.match(
      /\.meta\s*\((\{[\s\S]*?\})\)\s*\.handle/
    );
    const meta = metaMatch ? parseSimpleObject(metaMatch[1]) : {};
    const options: RouteContract['options'] = {};
    if (typeof meta.routerName === 'string') {
      options.routerName = meta.routerName;
    }
    if (typeof meta.ignoreGlobalPrefix === 'boolean') {
      options.ignoreGlobalPrefix = meta.ignoreGlobalPrefix;
    }
    routes[routeKey] = {
      method,
      path: parseStringLiteral(pathRaw),
      options,
    };
  }
  return routes;
}

export function transformDefineApiSource(source: string): ApiModuleContract[] {
  const modules: ApiModuleContract[] = [];
  const marker = 'export const ';
  let cursor = 0;
  while (cursor < source.length) {
    const exportIdx = source.indexOf(marker, cursor);
    if (exportIdx < 0) break;
    let i = exportIdx + marker.length;
    while (source[i] === ' ') i++;
    let j = i;
    while (j < source.length && isWord(source[j])) j++;
    const name = source.slice(i, j);
    const defineIdx = source.indexOf('defineApi', j);
    if (defineIdx < 0) break;
    const openParen = source.indexOf('(', defineIdx);
    if (openParen < 0) break;
    const closeParen = findMatching(source, openParen, '(', ')');
    if (closeParen < 0) break;
    const args = source.slice(openParen + 1, closeParen);
    const [prefixArg, factoryArg, optionsArg] = splitTopLevel(args, ',');
    if (!prefixArg || !factoryArg) {
      cursor = closeParen + 1;
      continue;
    }
    modules.push({
      name,
      prefix: parseStringLiteral(prefixArg),
      routes: parseFactoryRoutes(factoryArg),
      controllerOptions: optionsArg ? parseSimpleObject(optionsArg) : {},
    });
    cursor = closeParen + 1;
  }
  return modules;
}

function toCode(modules: ApiModuleContract[]) {
  const lines: string[] = [];
  for (const mod of modules) {
    lines.push(`const ${mod.name} = ${JSON.stringify(mod.routes, null, 2)};`);
    lines.push(
      `Object.defineProperty(${mod.name}, '__midwayApiMeta', { value: ${JSON.stringify(
        {
          prefix: mod.prefix,
          ignoreGlobalPrefix: mod.controllerOptions.ignoreGlobalPrefix,
          version: mod.controllerOptions.version,
          versionType: mod.controllerOptions.versionType,
          versionPrefix: mod.controllerOptions.versionPrefix,
        }
      )}, enumerable: false });`
    );
    lines.push(`export { ${mod.name} };`);
  }
  if (!lines.length) {
    return 'export {};';
  }
  return lines.join('\n');
}

function resolveCandidate(
  source: string,
  importer?: string,
  rootDir?: string
): string | null {
  const root = rootDir || process.cwd();
  if (isAbsolute(source)) return source;
  if (source.startsWith('@/')) {
    return resolve(root, 'src', source.slice(2));
  }
  if (source.startsWith('.') && importer) {
    return resolve(dirname(importer), source);
  }
  return null;
}

function tryResolveTsFile(candidate: string): string | null {
  const withExt = [
    candidate,
    `${candidate}.ts`,
    `${candidate}.tsx`,
    resolve(candidate, 'index.ts'),
    resolve(candidate, 'index.tsx'),
  ];
  for (const item of withExt) {
    try {
      const content = readFileSync(item, 'utf-8');
      if (typeof content === 'string') {
        return item;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

function shouldTransformApiFile(filePath: string) {
  try {
    const source = readFileSync(filePath, 'utf-8');
    if (!source.includes('defineApi')) {
      return false;
    }
    return transformDefineApiSource(source).length > 0;
  } catch {
    return false;
  }
}

export function apiPlugin(options: ApiPluginOptions) {
  if (!options?.apiDir) {
    throw new Error(
      '[midway:react] apiPlugin requires "apiDir" option'
    );
  }
  const rootDir = options.root || process.cwd();
  const apiDir = resolve(rootDir, options.apiDir);

  return {
    name: 'midway-api-bridge',
    enforce: 'pre',
    resolveId(source: string, importer?: string, resolveOptions?: { ssr?: boolean }) {
      // Keep server-side module loading untouched (e.g. vite dev middleware),
      // only rewrite browser-facing imports to web-safe contracts.
      if (resolveOptions?.ssr) {
        return null;
      }
      const candidate = resolveCandidate(source, importer, rootDir);
      if (!candidate) {
        return null;
      }
      const resolvedFile = tryResolveTsFile(candidate);
      if (!resolvedFile) {
        return null;
      }
      if (
        resolvedFile.startsWith(apiDir) &&
        shouldTransformApiFile(resolvedFile)
      ) {
        return `${VIRTUAL_PREFIX}${resolvedFile}`;
      }
      return null;
    },
    load(id: string) {
      if (!id.startsWith(VIRTUAL_PREFIX)) {
        return null;
      }
      const filePath = id.slice(VIRTUAL_PREFIX.length);
      const source = readFileSync(filePath, 'utf-8');
      const modules = transformDefineApiSource(source);
      return toCode(modules);
    },
  };
}
