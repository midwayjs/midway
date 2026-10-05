import fs from 'node:fs/promises';
import path from 'node:path';
import { Marked, type Tokens } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';
import { parse as parseYaml } from 'yaml';
import type {
  CatalogEntry,
  Lesson,
  Locale,
  Part,
  ProjectFiles,
  Track,
  Variant,
} from '../src/types.ts';

export const TRACKS: Track[] = ['class', 'function'];
export const LOCALES: Locale[] = ['zh-cn', 'en'];

const LANGS = ['ts', 'tsx', 'js', 'json', 'bash', 'yaml', 'diff'] as const;

/**
 * 读取 `content/` 与 `templates/`，生成教程运行时需要的数据。
 */
export class ContentLoader {
  private highlighter?: Promise<Highlighter>;
  private readonly root: string;

  constructor(root: string) {
    this.root = root;
  }

  get watchDirs() {
    return [path.join(this.root, 'content'), path.join(this.root, 'templates')];
  }

  /** 所有变体的轻量目录，供落地页和导航使用。 */
  async catalog(): Promise<CatalogEntry[]> {
    const entries: CatalogEntry[] = [];
    for (const track of TRACKS) {
      for (const locale of LOCALES) {
        const variant = await this.variant(track, locale);
        entries.push({
          track,
          locale,
          parts: variant.parts.map(part => ({
            slug: part.slug,
            title: part.title,
            lessons: part.lessons.map(l => ({ slug: l.slug, title: l.title })),
          })),
        });
      }
    }
    return entries;
  }

  /** 单个变体（风格 + 语言）的完整课程数据。 */
  async variant(track: Track, locale: Locale): Promise<Variant> {
    const dir = path.join(this.root, 'content', track, locale);
    const template = await readFiles(path.join(this.root, 'templates', track));
    const parts: Part[] = [];

    for (const partSlug of await listDirs(dir)) {
      const partDir = path.join(dir, partSlug);
      const meta = await this.readMarkdown(path.join(partDir, 'meta.md'));
      const lessons: Lesson[] = [];

      for (const lessonSlug of await listDirs(partDir)) {
        const lessonDir = path.join(partDir, lessonSlug);
        const doc = await this.readMarkdown(path.join(lessonDir, 'content.md'));
        lessons.push({
          slug: lessonSlug,
          title: doc.data.title ?? lessonSlug,
          focus: normalizePath(doc.data.focus ?? 'README.md'),
          preview: doc.data.preview ?? '/',
          html: doc.html,
          files: await readFiles(path.join(lessonDir, '_files')),
        });
      }

      parts.push({
        slug: partSlug,
        title: meta.data.title ?? partSlug,
        introHtml: meta.html,
        lessons,
      });
    }

    return { track, locale, template, parts };
  }

  /** 把一段代码渲染成带高亮的 HTML，用于落地页示例。 */
  async highlight(code: string, lang: string) {
    const highlighter = await this.getHighlighter();
    return renderCode(highlighter, code, lang);
  }

  private async readMarkdown(file: string) {
    const source = await fs.readFile(file, 'utf8').catch(() => '');
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    const data: { title?: string; focus?: string; preview?: string } = match
      ? parseYaml(match[1]) ?? {}
      : {};
    const body = match ? source.slice(match[0].length) : source;
    const html = body.trim() ? await this.renderMarkdown(body) : '';
    return { data, html };
  }

  private async renderMarkdown(source: string) {
    const highlighter = await this.getHighlighter();
    const marked = new Marked({
      gfm: true,
      renderer: {
        code({ text, lang }: Tokens.Code) {
          return renderCode(highlighter, text, lang ?? '');
        },
        link({ href, title, tokens }: Tokens.Link) {
          const text = this.parser.parseInline(tokens);
          const external = /^https?:\/\//.test(href);
          const attrs = [
            `href="${href}"`,
            title ? `title="${title}"` : '',
            external ? 'target="_blank" rel="noreferrer"' : '',
          ];
          return `<a ${attrs.filter(Boolean).join(' ')}>${text}</a>`;
        },
      },
    });
    return marked.parse(source, { async: false });
  }

  private getHighlighter() {
    this.highlighter ??= createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [...LANGS],
    });
    return this.highlighter;
  }
}

function renderCode(highlighter: Highlighter, code: string, rawLang: string) {
  const lang = normalizeLang(rawLang);
  const loaded = highlighter.getLoadedLanguages().includes(lang);
  const html = highlighter.codeToHtml(code.replace(/\n$/, ''), {
    lang: loaded ? lang : 'text',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
  const label = rawLang && rawLang !== 'txt' ? normalizeLang(rawLang) : '';
  const copy = '<button class="code-copy" type="button" aria-label="Copy"></button>';
  const header = label
    ? `<div class="code-header"><span class="code-lang">${label}</span>${copy}</div>`
    : copy;
  return `<div class="code-block${label ? ' has-header' : ''}">${header}${html}</div>`;
}

function normalizeLang(lang: string) {
  const map: Record<string, string> = {
    typescript: 'ts',
    javascript: 'js',
    sh: 'bash',
    shell: 'bash',
    yml: 'yaml',
  };
  const key = lang.trim().toLowerCase();
  return map[key] ?? key;
}

function normalizePath(p: string) {
  return p.replace(/^\/+/, '');
}

async function listDirs(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name)
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

async function readFiles(dir: string, base = dir): Promise<ProjectFiles> {
  const files: ProjectFiles = {};
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(files, await readFiles(full, base));
    } else if (entry.name !== '.DS_Store') {
      const rel = path.relative(base, full).split(path.sep).join('/');
      files[rel] = await fs.readFile(full, 'utf8');
    }
  }
  return files;
}
