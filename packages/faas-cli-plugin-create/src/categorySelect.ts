import * as Enquirer from 'enquirer';

function getChoices(groupChoices) {
  return Object.keys(groupChoices).map(template => {
    return `${template} - ${groupChoices[template].desc}`;
  });
}

function getGroups(groupChoices) {
  const groups = [];
  Object.keys(groupChoices).forEach((template, idx) => {
    if (
      groups.length === 0 ||
      groupChoices[template].group !== groups[groups.length - 1].group
    ) {
      groups.push({ idx, group: groupChoices[template].group });
    }
  });
  return groups;
}

/**
 * @example
 * ```ts
 * import a;
 * ＠provide()
 * export class B{}
 * ```
 * @returns string
 */
export class CategorySelect extends Enquirer['Select'] {
  [x: string]: any;
  groupIdx;
  options;
  state;
  multiple;
  emptyError;
  constructor(options) {
    options.choices = getChoices(options.groupChoices);
    super(options);
    this.groupIdx = getGroups(options.groupChoices);
  }
  async renderChoices() {
    if (this.state.loading === 'choices') {
      return this.styles.warning('Loading choices');
    }

    if (this.state.submitted) return '';
    const choices = [];
    this.visible.forEach(async (ch, i) => {
      const group = this.groupIdx.find(el => {
        return el.idx === i;
      });
      if (group) {
        choices.push(
          this.resolve(this.styles.muted('\n ⊙ ' + group.group), this.state)
        );
      }
      choices.push(this.renderChoice(ch, i));
    });
    const visible = await Promise.all(choices);
    if (!visible.length)
      visible.push(this.styles.danger('No matching choices'));
    const result = this.margin[0] + visible.join('\n');
    let header;

    if (this.options.choicesHeader) {
      header = await this.resolve(this.options.choicesHeader, this.state);
    }

    return [header, result].filter(Boolean).join('\n');
  }

  format() {
    if (!this.state.submitted || this.state.cancelled) return '';
    if (Array.isArray(this.selected)) {
      return this.selected
        .map(choice => this.styles.primary(choice.name))
        .join(', ');
    }
    return this.styles.primary(this.selected.name);
  }
}
