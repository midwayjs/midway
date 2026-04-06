import * as path from 'path';
import type { ApiRecord } from '../types';
import {
  createWorkspacePackageMap,
  filePathToSourceUrl,
  normalizeWhitespace,
  readJsonFile,
  toPosixPath,
} from '../utils';

interface TypedocNode {
  name?: string;
  kind?: number;
  kindString?: string;
  children?: TypedocNode[];
  comment?: {
    summary?: Array<{ text?: string }>;
    blockTags?: Array<{ tag?: string; content?: Array<{ text?: string }> }>;
    modifierTags?: string[];
  };
  flags?: {
    isDeprecated?: boolean;
  };
  sources?: Array<{
    fileName?: string;
    line?: number;
    url?: string;
  }>;
}

interface CollectApiRecordsOptions {
  repoRoot: string;
  typedocJsonPath: string;
  version: string;
  repoBlobBaseUrl: string;
}

const REFLECTION_KIND_LABELS: Record<number, string> = {
  1: 'Project',
  2: 'Module',
  4: 'Namespace',
  8: 'Enum',
  16: 'EnumMember',
  32: 'Variable',
  64: 'Function',
  128: 'Class',
  256: 'Interface',
  512: 'Constructor',
  1024: 'Property',
  2048: 'Method',
  4096: 'CallSignature',
  8192: 'IndexSignature',
  16384: 'ConstructorSignature',
  32768: 'Parameter',
  65536: 'TypeLiteral',
  131072: 'TypeParameter',
  262144: 'Accessor',
  524288: 'GetSignature',
  1048576: 'SetSignature',
  2097152: 'ObjectLiteral',
  4194304: 'TypeAlias',
  8388608: 'Reference',
};

const EXCLUDED_KINDS = new Set<number>([
  1,
  2,
  4096,
  8192,
  16384,
  32768,
  65536,
  131072,
  8388608,
]);

export function collectApiRecords(
  options: CollectApiRecordsOptions
): ApiRecord[] {
  if (!path.isAbsolute(options.typedocJsonPath)) {
    throw new Error('typedocJsonPath must be an absolute path');
  }

  const packageNameMap = createWorkspacePackageMap(options.repoRoot);
  const root = readJsonFile<TypedocNode>(options.typedocJsonPath);
  const records: ApiRecord[] = [];

  for (const moduleNode of root.children ?? []) {
    const packageName = resolvePackageName(moduleNode.name ?? '', packageNameMap);
    walkTypedocTree(records, moduleNode, {
      version: options.version,
      packageName,
      ancestors: [],
      repoRoot: options.repoRoot,
      repoBlobBaseUrl: options.repoBlobBaseUrl,
      typedocJsonPath: options.typedocJsonPath,
    });
  }

  return records.sort((left, right) =>
    left.qualifiedName.localeCompare(right.qualifiedName)
  );
}

function walkTypedocTree(
  records: ApiRecord[],
  node: TypedocNode,
  context: {
    version: string;
    packageName: string;
    ancestors: string[];
    repoRoot: string;
    repoBlobBaseUrl: string;
    typedocJsonPath: string;
  }
): void {
  const nextAncestors =
    shouldAddToQualifiedName(node) && node.name
      ? [...context.ancestors, node.name]
      : context.ancestors;

  if (shouldCreateApiRecord(node) && node.name) {
    records.push(createApiRecord(node, {
      ...context,
      qualifiedName: nextAncestors.join('.'),
    }));
  }

  for (const child of node.children ?? []) {
    walkTypedocTree(records, child, {
      ...context,
      ancestors: nextAncestors,
    });
  }
}

function shouldAddToQualifiedName(node: TypedocNode): boolean {
  return Boolean(node.name && node.kind !== 2 && node.kind !== 1);
}

function shouldCreateApiRecord(node: TypedocNode): boolean {
  if (!node.name || typeof node.kind !== 'number') {
    return false;
  }
  return !EXCLUDED_KINDS.has(node.kind);
}

function createApiRecord(
  node: TypedocNode,
  context: {
    version: string;
    packageName: string;
    qualifiedName: string;
    repoRoot: string;
    repoBlobBaseUrl: string;
    typedocJsonPath: string;
  }
): ApiRecord {
  const source = node.sources?.[0];
  const sourcePath = resolveSourcePath(source?.fileName, context);
  const sourceUrl = resolveSourceUrl(source, context);

  return {
    id: `api:${context.version}:${context.packageName}:${context.qualifiedName}`,
    kind: 'api',
    version: context.version,
    packageName: context.packageName,
    symbolName: node.name!,
    symbolKind:
      node.kindString ??
      REFLECTION_KIND_LABELS[node.kind!] ??
      `Kind(${node.kind})`,
    qualifiedName: context.qualifiedName,
    summary: resolveCommentSummary(node),
    deprecated: Boolean(
      node.flags?.isDeprecated ||
        node.comment?.modifierTags?.includes('@deprecated')
    ),
    sourcePath,
    sourceUrl,
  };
}

function resolvePackageName(
  moduleName: string,
  packageNameMap: Map<string, string>
): string {
  const folderName = moduleName.split('/')[0];
  return packageNameMap.get(folderName) ?? folderName;
}

function resolveCommentSummary(node: TypedocNode): string {
  const summary = node.comment?.summary
    ?.map(block => block.text ?? '')
    .join('');
  return normalizeWhitespace(summary ?? '');
}

function resolveSourcePath(
  fileName: string | undefined,
  context: { repoRoot: string; typedocJsonPath: string }
): string {
  if (!fileName) {
    return toPosixPath(path.relative(context.repoRoot, context.typedocJsonPath));
  }

  const sourcePath = path.isAbsolute(fileName)
    ? fileName
    : path.join(context.repoRoot, fileName);
  return toPosixPath(path.relative(context.repoRoot, sourcePath));
}

function resolveSourceUrl(
  source: TypedocNode['sources'][number] | undefined,
  context: {
    repoRoot: string;
    repoBlobBaseUrl: string;
    typedocJsonPath: string;
  }
): string {
  if (source?.url) {
    return source.url;
  }

  if (!source?.fileName) {
    return filePathToSourceUrl(
      context.repoRoot,
      context.typedocJsonPath,
      context.repoBlobBaseUrl
    );
  }

  const absoluteSourcePath = path.isAbsolute(source.fileName)
    ? source.fileName
    : path.join(context.repoRoot, source.fileName);
  const fileUrl = filePathToSourceUrl(
    context.repoRoot,
    absoluteSourcePath,
    context.repoBlobBaseUrl
  );

  return source.line ? `${fileUrl}#L${source.line}` : fileUrl;
}
