export type SkillCliLocale = 'zh-CN' | 'en';

const CHINESE_LOCALES = ['zh', 'zh-cn', 'zh-hans', 'zh-hant', 'zh-tw', 'zh-hk'];

export function resolveSkillCliLocale(env = process.env): SkillCliLocale {
  const rawLocale =
    env.MIDWAY_SKILL_LOCALE || env.LC_ALL || env.LC_MESSAGES || env.LANG || '';
  const normalized = rawLocale.toLowerCase().replace('_', '-');

  if (CHINESE_LOCALES.some(locale => normalized.startsWith(locale))) {
    return 'zh-CN';
  }

  return 'en';
}

const MESSAGES = {
  en: {
    installTargetPrompt:
      'Select the install targets (Space to select, Enter to confirm)',
    installTargetRequired: 'Select at least one install target',
    installSummaryTitle: 'Installed Midway skill',
    updateSummaryTitle: 'Updated Midway skill',
    summarySkill: 'Skill',
    summaryProject: 'Project',
    summaryTargets: 'Targets',
    summaryOverwritten: 'overwritten',
  },
  'zh-CN': {
    installTargetPrompt: '选择安装目标（空格选中，回车确认）',
    installTargetRequired: '至少选择一个安装目标',
    installSummaryTitle: '已安装 Midway skill',
    updateSummaryTitle: '已更新 Midway skill',
    summarySkill: 'Skill',
    summaryProject: '项目',
    summaryTargets: '目标',
    summaryOverwritten: '已覆盖',
  },
} as const;

export function getSkillCliMessage(
  key: keyof (typeof MESSAGES)['en'],
  locale = resolveSkillCliLocale()
): string {
  return MESSAGES[locale][key] ?? MESSAGES.en[key];
}
