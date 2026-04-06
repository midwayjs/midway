import { normalizeWhitespace } from '../utils';

interface ParsedFrontMatter {
  body: string;
  attributes: Record<string, string>;
}

/**
 * Parse the minimal front matter shape used by Midway docs.
 * The generator only relies on simple `key: value` pairs so it can stay dependency free.
 */
export function parseFrontMatter(content: string): ParsedFrontMatter {
  if (!content.startsWith('---\n')) {
    return {
      body: content,
      attributes: {},
    };
  }

  const closingIndex = content.indexOf('\n---\n', 4);
  if (closingIndex === -1) {
    return {
      body: content,
      attributes: {},
    };
  }

  const rawFrontMatter = content.slice(4, closingIndex);
  const body = content.slice(closingIndex + 5);
  const attributes: Record<string, string> = {};

  for (const rawLine of rawFrontMatter.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    attributes[key] = value;
  }

  return {
    body,
    attributes,
  };
}

export function extractMarkdownHeadings(content: string): string[] {
  const headings: string[] = [];
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content))) {
    headings.push(normalizeWhitespace(match[1]));
  }

  return headings;
}

export function resolveMarkdownTitle(
  rawContent: string,
  fallbackTitle: string
): { title: string; body: string; headings: string[]; summary: string } {
  const parsed = parseFrontMatter(rawContent);
  const headings = extractMarkdownHeadings(parsed.body);
  const title = parsed.attributes.title ?? headings[0] ?? fallbackTitle;
  const summary = resolveMarkdownSummary(parsed.body);

  return {
    title,
    body: parsed.body,
    headings,
    summary,
  };
}

export function resolveMarkdownSummary(content: string): string {
  const cleaned = content
    .split('\n')
    .map(line => line.trim())
    .filter(
      line => line && !line.startsWith('#') && !line.startsWith('import ')
    )
    .join('\n')
    .split('\n\n')
    .map(paragraph => normalizeWhitespace(paragraph))
    .find(paragraph => Boolean(paragraph));

  return cleaned ?? '';
}
