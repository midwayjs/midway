import * as path from 'path';
import type { SkillContent, SkillTargetAdapter } from './types';

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}

function formatYamlTags(tags: string[]): string {
  return `[${tags.map(tag => escapeYamlValue(tag)).join(', ')}]`;
}

function descriptionAdapter(
  target: string,
  relativePath: (content: SkillContent) => string
): SkillTargetAdapter {
  return {
    target,
    getFiles(content) {
      return [
        {
          relativePath: relativePath(content),
          content: `---\ndescription: ${content.description}\n---\n\n${content.body}\n`,
        },
      ];
    },
  };
}

function descriptionArgumentHintAdapter(
  target: string,
  relativePath: (content: SkillContent) => string
): SkillTargetAdapter {
  return {
    target,
    getFiles(content) {
      return [
        {
          relativePath: relativePath(content),
          content:
            `---\n` +
            `description: ${content.description}\n` +
            `argument-hint: command arguments\n` +
            `---\n\n${content.body}\n`,
        },
      ];
    },
  };
}

function namedCommandAdapter(
  target: string,
  relativePath: (content: SkillContent) => string
): SkillTargetAdapter {
  return {
    target,
    getFiles(content) {
      return [
        {
          relativePath: relativePath(content),
          content:
            `---\n` +
            `name: ${escapeYamlValue(content.name)}\n` +
            `description: ${escapeYamlValue(content.description)}\n` +
            `category: ${escapeYamlValue(content.category)}\n` +
            `tags: ${formatYamlTags(content.tags)}\n` +
            `---\n\n${content.body}\n`,
        },
      ];
    },
  };
}

function simpleNamedCommandAdapter(
  target: string,
  relativePath: (content: SkillContent) => string
): SkillTargetAdapter {
  return {
    target,
    getFiles(content) {
      return [
        {
          relativePath: relativePath(content),
          content:
            `---\n` +
            `name: ${content.name}\n` +
            `description: ${content.description}\n` +
            `category: ${content.category}\n` +
            `tags: [${content.tags.join(', ')}]\n` +
            `---\n\n${content.body}\n`,
        },
      ];
    },
  };
}

function markdownHeaderAdapter(
  target: string,
  relativePath: (content: SkillContent) => string
): SkillTargetAdapter {
  return {
    target,
    getFiles(content) {
      return [
        {
          relativePath: relativePath(content),
          content: `# ${content.name}\n\n${content.description}\n\n${content.body}\n`,
        },
      ];
    },
  };
}

function tomlAdapter(
  target: string,
  relativePath: (content: SkillContent) => string
): SkillTargetAdapter {
  return {
    target,
    getFiles(content) {
      return [
        {
          relativePath: relativePath(content),
          content:
            `description = "${content.description.replace(/"/g, '\\"')}"\n\n` +
            `prompt = """\n${content.body}\n"""\n`,
        },
      ];
    },
  };
}

function cursorLikeAdapter(
  target: string,
  relativePath: (content: SkillContent) => string
): SkillTargetAdapter {
  return {
    target,
    getFiles(content) {
      return [
        {
          relativePath: relativePath(content),
          content:
            `---\n` +
            `name: /opsx-${content.id}\n` +
            `id: opsx-${content.id}\n` +
            `category: ${escapeYamlValue(content.category)}\n` +
            `description: ${escapeYamlValue(content.description)}\n` +
            `---\n\n${content.body}\n`,
        },
      ];
    },
  };
}

function continueAdapter(): SkillTargetAdapter {
  return {
    target: 'continue',
    getFiles(content) {
      return [
        {
          relativePath: path.join('.continue', 'prompts', `opsx-${content.id}.prompt`),
          content:
            `---\n` +
            `name: opsx-${content.id}\n` +
            `description: ${content.description}\n` +
            `invokable: true\n` +
            `---\n\n${content.body}\n`,
        },
      ];
    },
  };
}

function codebuddyAdapter(): SkillTargetAdapter {
  return {
    target: 'codebuddy',
    getFiles(content) {
      return [
        {
          relativePath: path.join('.codebuddy', 'commands', 'opsx', `${content.id}.md`),
          content:
            `---\n` +
            `name: ${content.name}\n` +
            `description: "${content.description.replace(/"/g, '\\"')}"\n` +
            `argument-hint: "[command arguments]"\n` +
            `---\n\n${content.body}\n`,
        },
      ];
    },
  };
}

function codexAdapter(): SkillTargetAdapter {
  return {
    target: 'codex',
    getFiles(content) {
      return [
        {
          relativePath: path.join('.codex', 'skills', content.id, 'SKILL.md'),
          content: content.rawSkillMarkdown.endsWith('\n')
            ? content.rawSkillMarkdown
            : `${content.rawSkillMarkdown}\n`,
        },
        ...content.assetFiles.map(file => ({
          relativePath: path.join('.codex', 'skills', content.id, file.relativePath),
          content: file.content,
        })),
      ];
    },
  };
}

function kilocodeAdapter(): SkillTargetAdapter {
  return {
    target: 'kilocode',
    getFiles(content) {
      return [
        {
          relativePath: path.join('.kilocode', 'workflows', `opsx-${content.id}.md`),
          content: `${content.body}\n`,
        },
      ];
    },
  };
}

function traeAdapter(): SkillTargetAdapter {
  return {
    target: 'trae',
    getFiles(content) {
      return [
        {
          relativePath: path.join('.trae', 'skills', content.id, 'SKILL.md'),
          content: content.rawSkillMarkdown.endsWith('\n')
            ? content.rawSkillMarkdown
            : `${content.rawSkillMarkdown}\n`,
        },
        ...content.assetFiles.map(file => ({
          relativePath: path.join('.trae', 'skills', content.id, file.relativePath),
          content: file.content,
        })),
      ];
    },
  };
}

const adapters: SkillTargetAdapter[] = [
  descriptionAdapter('amazon-q', content =>
    path.join('.amazonq', 'prompts', `opsx-${content.id}.md`)
  ),
  descriptionAdapter('antigravity', content =>
    path.join('.agent', 'workflows', `opsx-${content.id}.md`)
  ),
  descriptionArgumentHintAdapter('auggie', content =>
    path.join('.augment', 'commands', `opsx-${content.id}.md`)
  ),
  namedCommandAdapter('claude', content =>
    path.join('.claude', 'commands', 'opsx', `${content.id}.md`)
  ),
  markdownHeaderAdapter('cline', content =>
    path.join('.clinerules', 'workflows', `opsx-${content.id}.md`)
  ),
  codebuddyAdapter(),
  codexAdapter(),
  continueAdapter(),
  {
    target: 'costrict',
    getFiles(content) {
      return [
        {
          relativePath: path.join('.cospec', 'openspec', 'commands', `opsx-${content.id}.md`),
          content:
            `---\n` +
            `description: "${content.description.replace(/"/g, '\\"')}"\n` +
            `argument-hint: command arguments\n` +
            `---\n\n${content.body}\n`,
        },
      ];
    },
  },
  simpleNamedCommandAdapter('crush', content =>
    path.join('.crush', 'commands', 'opsx', `${content.id}.md`)
  ),
  cursorLikeAdapter('cursor', content =>
    path.join('.cursor', 'commands', `opsx-${content.id}.md`)
  ),
  descriptionArgumentHintAdapter('factory', content =>
    path.join('.factory', 'commands', `opsx-${content.id}.md`)
  ),
  tomlAdapter('gemini', content =>
    path.join('.gemini', 'commands', 'opsx', `${content.id}.toml`)
  ),
  descriptionAdapter('github-copilot', content =>
    path.join('.github', 'prompts', `opsx-${content.id}.prompt.md`)
  ),
  cursorLikeAdapter('iflow', content =>
    path.join('.iflow', 'commands', `opsx-${content.id}.md`)
  ),
  kilocodeAdapter(),
  descriptionAdapter('kiro', content =>
    path.join('.kiro', 'prompts', `opsx-${content.id}.prompt.md`)
  ),
  descriptionAdapter('opencode', content =>
    path.join('.opencode', 'commands', `opsx-${content.id}.md`)
  ),
  descriptionAdapter('pi', content =>
    path.join('.pi', 'prompts', `opsx-${content.id}.md`)
  ),
  simpleNamedCommandAdapter('qoder', content =>
    path.join('.qoder', 'commands', 'opsx', `${content.id}.md`)
  ),
  tomlAdapter('qwen', content =>
    path.join('.qwen', 'commands', `opsx-${content.id}.toml`)
  ),
  markdownHeaderAdapter('roocode', content =>
    path.join('.roo', 'commands', `opsx-${content.id}.md`)
  ),
  traeAdapter(),
  namedCommandAdapter('windsurf', content =>
    path.join('.windsurf', 'workflows', `opsx-${content.id}.md`)
  ),
];

export class SkillTargetRegistry {
  private static readonly adapters = new Map(
    adapters.map(adapter => [adapter.target, adapter])
  );

  static get(target: string): SkillTargetAdapter | undefined {
    return SkillTargetRegistry.adapters.get(target);
  }

  static getAll(): SkillTargetAdapter[] {
    return Array.from(SkillTargetRegistry.adapters.values());
  }

  static getSupportedTargets(): string[] {
    return Array.from(SkillTargetRegistry.adapters.keys()).sort();
  }
}
