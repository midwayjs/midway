import * as path from 'path';
import { Inject } from '@midwayjs/core';
import { EnquirerService } from '@midwayjs/commander';
import { Command, CommandRunner, Option } from '@midwayjs/commander';
import { formatInstallSkillResult, installSkill } from '../install';
import { InstallTargetQuestionSet } from '../questions/install-target.question';
import { resolveInvocationCwd } from '../support';

@Command({
  name: 'update',
  description:
    'Overwrite an existing installed Midway skill for a local AI client target',
})
export class UpdateCommand implements CommandRunner {
  @Inject()
  enquirerService: EnquirerService;

  @Option({
    flags: '--target [name]',
    description: 'Install target such as codex, cursor, trae, or all',
  })
  parseTarget(value: string) {
    return value.trim().toLowerCase();
  }

  @Option({
    flags: '--dest [path]',
    description:
      'Override the project root used for target-relative installation',
  })
  parseDestination(value: string) {
    return path.resolve(resolveInvocationCwd(), value);
  }

  async run(
    _passedParams: string[],
    options?: {
      target?: string;
      dest?: string;
    }
  ) {
    let target = options?.target;

    if (!target) {
      if (!process.stdin.isTTY || !process.stdout.isTTY) {
        throw new Error(
          'No interactive TTY detected. Re-run with --target <name>, for example: midway-skill update --target codex'
        );
      }

      target = (
        await this.enquirerService.prompt<{ target: string }>(
          InstallTargetQuestionSet
        )
      ).target;
    }

    const result = installSkill({
      target,
      dest: options?.dest,
      overwrite: true,
    });

    return formatInstallSkillResult(result, 'update');
  }
}
