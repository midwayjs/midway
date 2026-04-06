import * as fs from 'fs';
import * as path from 'path';
import type { ChangelogRecord } from '../types';
import {
  filePathToSourceUrl,
  normalizeWhitespace,
  toPosixPath,
} from '../utils';

const RELEASE_HEADING_REGEX = /^##\s+v?([^\s]+)\s+\(([^)]+)\)\s*$/gm;

export function collectChangelogRecords(options: {
  repoRoot: string;
  changelogPath: string;
  repoBlobBaseUrl: string;
}): ChangelogRecord[] {
  const content = fs.readFileSync(options.changelogPath, 'utf8');
  const matches = Array.from(content.matchAll(RELEASE_HEADING_REGEX));
  const sourcePath = toPosixPath(
    path.relative(options.repoRoot, options.changelogPath)
  );
  const sourceUrl = filePathToSourceUrl(
    options.repoRoot,
    options.changelogPath,
    options.repoBlobBaseUrl
  );

  return matches.map((match, index) => {
    const sectionStart = match.index ?? 0;
    const sectionEnd =
      index + 1 < matches.length
        ? matches[index + 1].index ?? content.length
        : content.length;
    const releaseVersion = match[1];
    const releaseDate = match[2];
    const body = content
      .slice(sectionStart, sectionEnd)
      .split('\n')
      .slice(1)
      .join('\n')
      .trim();

    return {
      id: `changelog:${releaseVersion}`,
      kind: 'changelog',
      releaseVersion,
      releaseDate,
      majorVersion: releaseVersion.split('.')[0],
      summary: resolveChangelogSummary(body),
      content: body,
      packageNames: resolvePackageNames(body),
      sourcePath,
      sourceUrl: `${sourceUrl}#v${releaseVersion.replace(/\./g, '')}`,
    };
  });
}

function resolveChangelogSummary(body: string): string {
  const firstUsefulLine = body
    .split('\n')
    .map(line => normalizeWhitespace(line))
    .find(line => line && !line.startsWith('#### ') && !line.startsWith('- '));

  if (firstUsefulLine) {
    return firstUsefulLine;
  }

  const bulletLine = body
    .split('\n')
    .map(line => normalizeWhitespace(line))
    .find(line => line.startsWith('* ') || line.startsWith('- '));

  return bulletLine ?? '';
}

function resolvePackageNames(body: string): string[] {
  const names = new Set<string>();
  const codeSpanRegex = /`([^`]+)`/g;

  for (const line of body.split('\n')) {
    let match: RegExpExecArray | null;
    while ((match = codeSpanRegex.exec(line))) {
      for (const part of match[1].split(',')) {
        const value = normalizeWhitespace(part).replace(/^@midwayjs\//, '');
        if (value && !value.includes(' ') && !value.includes('/')) {
          names.add(value);
        }
      }
    }
  }

  return Array.from(names).sort();
}
