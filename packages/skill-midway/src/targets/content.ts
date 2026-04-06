import * as fs from 'fs';
import * as path from 'path';
import { parseFrontMatter } from '../bundle/markdown';
import { resolvePackageRoot } from '../cli/support';
import type { SkillContent, TargetFile } from './types';

const DEFAULT_TAGS = ['midway', 'framework', 'nodejs', 'typescript', 'skill'];

export function readBuiltInSkillContent(skillId = 'midway'): SkillContent {
  const skillRoot = path.join(resolvePackageRoot(), 'skills', skillId);
  const skillPath = path.join(skillRoot, 'SKILL.md');
  const rawSkillMarkdown = fs.readFileSync(skillPath, 'utf8');
  const parsed = parseFrontMatter(rawSkillMarkdown);

  return {
    id: parsed.attributes.name ?? skillId,
    name: 'Midway',
    description:
      parsed.attributes.description ??
      'Use when the task involves Midway framework docs, APIs, packages, or version compatibility.',
    category: 'Framework',
    tags: DEFAULT_TAGS,
    body: parsed.body.trim(),
    rawSkillMarkdown,
    assetFiles: collectSkillAssetFiles(skillRoot),
  };
}

function collectSkillAssetFiles(skillRoot: string): TargetFile[] {
  if (!fs.existsSync(skillRoot)) {
    return [];
  }

  const files: TargetFile[] = [];
  const walk = (currentDir: string) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      const relativePath = path.relative(skillRoot, absolutePath);
      if (relativePath === 'SKILL.md') {
        continue;
      }

      files.push({
        relativePath,
        content: fs.readFileSync(absolutePath, 'utf8'),
      });
    }
  };

  walk(skillRoot);
  return files;
}
