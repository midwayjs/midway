import * as fs from 'fs';
import * as path from 'path';
import { getSkillCliMessage } from './locale';
import { resolveInvocationCwd } from './support';
import { readBuiltInSkillContent, SkillTargetRegistry } from '../targets';

export interface InstallSkillOptions {
  target?: string;
  dest?: string;
  overwrite?: boolean;
}

export interface InstalledTargetResult {
  target: string;
  destinationPaths: string[];
  overwritten: boolean;
}

export interface InstallSkillResult {
  projectRoot: string;
  supportedTargets: string[];
  installed: InstalledTargetResult[];
  skillName: string;
}

export type InstallSummaryAction = 'install' | 'update';

export function resolveInstallRoot(dest?: string): string {
  if (dest) {
    return path.resolve(dest);
  }

  return resolveInvocationCwd();
}

export function installSkill(
  options: InstallSkillOptions = {}
): InstallSkillResult {
  const projectRoot = resolveInstallRoot(options.dest);
  const content = readBuiltInSkillContent();
  const supportedTargets = SkillTargetRegistry.getSupportedTargets();
  const targets = resolveTargets(options.target);
  const installed: InstalledTargetResult[] = [];

  for (const target of targets) {
    const adapter = SkillTargetRegistry.get(target);
    if (!adapter) {
      throw new Error(`Unsupported install target: ${target}`);
    }

    const files = adapter.getFiles(content);
    const destinationPaths = files.map(file =>
      path.join(projectRoot, file.relativePath)
    );
    const overwritten = destinationPaths.some(filePath => fs.existsSync(filePath));

    if (overwritten && !options.overwrite) {
      throw new Error(
        `Target ${target} already exists. Run update or pass overwrite.`
      );
    }

    for (const destinationPath of destinationPaths) {
      if (fs.existsSync(destinationPath) && options.overwrite) {
        fs.rmSync(destinationPath, { recursive: true, force: true });
      }
    }

    for (const file of files) {
      const destinationPath = path.join(projectRoot, file.relativePath);
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
      fs.writeFileSync(destinationPath, file.content);
    }

    installed.push({
      target,
      destinationPaths,
      overwritten,
    });
  }

  return {
    projectRoot,
    supportedTargets,
    installed,
    skillName: content.id,
  };
}

export function formatInstallSkillResult(
  result: InstallSkillResult,
  action: InstallSummaryAction
): string {
  const lines = [
    action === 'install'
      ? getSkillCliMessage('installSummaryTitle')
      : getSkillCliMessage('updateSummaryTitle'),
    `${getSkillCliMessage('summarySkill')}: ${result.skillName}`,
    `${getSkillCliMessage('summaryProject')}: ${result.projectRoot}`,
    `${getSkillCliMessage('summaryTargets')}:`,
  ];

  for (const item of result.installed) {
    lines.push(`- ${item.target}`);
    for (const destinationPath of item.destinationPaths) {
      lines.push(`  ${destinationPath}`);
    }
    if (item.overwritten) {
      lines.push(`  (${getSkillCliMessage('summaryOverwritten')})`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function resolveTargets(target?: string): string[] {
  const requested = (target ?? 'codex')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

  if (requested.length === 1 && requested[0] === 'all') {
    return SkillTargetRegistry.getSupportedTargets();
  }

  return Array.from(new Set(requested));
}
