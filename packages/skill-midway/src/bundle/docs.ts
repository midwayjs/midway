import * as fs from 'fs';
import * as path from 'path';
import { resolveMarkdownTitle } from './markdown';
import type { DocRecord } from '../types';
import {
  filePathToSourceUrl,
  listFilesRecursively,
  stripFileExtension,
  toPosixPath,
} from '../utils';

interface CollectDocRecordsOptions {
  repoRoot: string;
  docsRoot: string;
  version: string;
  locale: string;
  repoBlobBaseUrl: string;
}

export function collectDocRecords(
  options: CollectDocRecordsOptions
): DocRecord[] {
  const markdownFiles = listFilesRecursively(options.docsRoot).filter(
    filePath => /\.(md|mdx)$/i.test(filePath)
  );

  return markdownFiles
    .map(filePath => createDocRecord(filePath, options))
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

function createDocRecord(
  filePath: string,
  options: CollectDocRecordsOptions
): DocRecord {
  const relativeDocPath = toPosixPath(
    path.relative(options.docsRoot, filePath)
  );
  const slug = stripFileExtension(relativeDocPath);
  const fallbackTitle = path.basename(slug);
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = resolveMarkdownTitle(content, fallbackTitle);
  const sourcePath = toPosixPath(path.relative(options.repoRoot, filePath));

  return {
    id: `doc:${options.version}:${options.locale}:${slug}`,
    kind: 'doc',
    version: options.version,
    locale: options.locale,
    slug,
    title: parsed.title,
    summary: parsed.summary,
    headings: parsed.headings,
    sourcePath,
    sourceUrl: filePathToSourceUrl(
      options.repoRoot,
      filePath,
      options.repoBlobBaseUrl
    ),
  };
}
