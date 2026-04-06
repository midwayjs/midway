import { SkillTargetRegistry } from '../../targets';

import {
  ChoicesFor,
  MessageFor,
  Question,
  QuestionSet,
  ValidateFor,
} from '@midwayjs/commander';
import { getSkillCliMessage } from '../locale';

@QuestionSet({ name: 'installTarget' })
export class InstallTargetQuestionSet {
  @Question({
    type: 'multiselect',
    name: 'target',
  })
  parseTarget(value: string[]) {
    return value.join(',');
  }

  @MessageFor({ name: 'target' })
  resolveMessage() {
    return getSkillCliMessage('installTargetPrompt');
  }

  @ChoicesFor({ name: 'target' })
  resolveChoices() {
    return [
      'codex',
      'cursor',
      'trae',
      ...SkillTargetRegistry.getSupportedTargets().filter(
        target => !['codex', 'cursor', 'trae'].includes(target)
      ),
    ];
  }

  @ValidateFor({ name: 'target' })
  validateTarget(value: string[]) {
    return Array.isArray(value) && value.length > 0
      ? true
      : getSkillCliMessage('installTargetRequired');
  }
}
