import { FilteredAdapter, Helper, Model } from 'casbin';

interface Line {
  ptype: string;
  v0: string;
  v1: string;
  v2: string;
  v3: string;
  v4: string;
  v5: string;
}

export abstract class BaseAdapter<AdapterLine extends Line>
  implements FilteredAdapter
{
  private filtered = false;
  private policies: AdapterLine[];

  public isFiltered(): boolean {
    return this.filtered;
  }

  public async loadPolicy(model: Model): Promise<void> {
    const policies = await this.loadPolicyByAdapter();
    this.policies = policies;
    for (const line of policies) {
      this.loadPolicyLine(line, model);
    }
  }

  public async savePolicy(model: Model): Promise<boolean> {
    const policyRuleAST = model.model.get('p')!;
    const groupingPolicyAST = model.model.get('g')!;
    const policies: AdapterLine[] = [];

    for (const astMap of [policyRuleAST, groupingPolicyAST]) {
      for (const [ptype, ast] of astMap) {
        for (const rule of ast.policy) {
          const line = this.savePolicyLine(ptype, rule);
          policies.push(line);
        }
      }
    }

    await this.savePolicyByAdapter(policies);
    return true;
  }

  public async addPolicy(
    sec: string,
    ptype: string,
    rule: string[]
  ): Promise<void> {
    const line = this.savePolicyLine(ptype, rule);
    this.policies.push(line);
    await this.savePolicyByAdapter(this.policies);
  }

  public async removePolicy(
    sec: string,
    ptype: string,
    rule: string[]
  ): Promise<void> {
    const filteredPolicies = this.policies.filter(policy => {
      let flag = true;
      flag &&= ptype === policy.ptype;
      if (rule.length > 0) {
        flag &&= rule[0] === policy.v0;
      }
      if (rule.length > 1) {
        flag &&= rule[1] === policy.v1;
      }
      if (rule.length > 2) {
        flag &&= rule[2] === policy.v2;
      }
      if (rule.length > 3) {
        flag &&= rule[3] === policy.v3;
      }
      if (rule.length > 4) {
        flag &&= rule[4] === policy.v4;
      }
      if (rule.length > 5) {
        flag &&= rule[5] === policy.v5;
      }
      return !flag;
    });
    this.policies = filteredPolicies;
    const line = this.savePolicyLine(ptype, rule);
    await this.removePolicyByAdapter(line, filteredPolicies);
  }

  public async loadFilteredPolicy(model: Model, filter: any): Promise<void> {
    const filteredPolicies = await this.loadPolicyWithFilterByAdapter(filter);
    this.policies = filteredPolicies;
    filteredPolicies.forEach((policy: any) => {
      this.loadPolicyLine(policy, model);
    });
    this.filtered = true;
  }

  public async removeFilteredPolicy(
    sec: string,
    ptype: string,
    fieldIndex: number,
    ...fieldValues: string[]
  ): Promise<void> {
    const rule = new Array<string>(fieldIndex).fill('');
    rule.push(...fieldValues);
    const filteredPolicies = this.policies.filter(policy => {
      let flag = true;
      flag &&= ptype === policy.ptype;
      if (rule.length > 0 && rule[0]) {
        flag &&= rule[0] === policy.v0;
      }
      if (rule.length > 1 && rule[1]) {
        flag &&= rule[1] === policy.v1;
      }
      if (rule.length > 2 && rule[2]) {
        flag &&= rule[2] === policy.v2;
      }
      if (rule.length > 3 && rule[3]) {
        flag &&= rule[3] === policy.v3;
      }
      if (rule.length > 4 && rule[4]) {
        flag &&= rule[4] === policy.v4;
      }
      if (rule.length > 5 && rule[5]) {
        flag &&= rule[5] === policy.v5;
      }
      return !flag;
    });
    this.policies = filteredPolicies;

    const line = new (this.getAdapterLine())();

    line.ptype = ptype;

    if (fieldIndex <= 0 && 0 < fieldIndex + fieldValues.length) {
      line.v0 = fieldValues[0 - fieldIndex];
    }
    if (fieldIndex <= 1 && 1 < fieldIndex + fieldValues.length) {
      line.v1 = fieldValues[1 - fieldIndex];
    }
    if (fieldIndex <= 2 && 2 < fieldIndex + fieldValues.length) {
      line.v2 = fieldValues[2 - fieldIndex];
    }
    if (fieldIndex <= 3 && 3 < fieldIndex + fieldValues.length) {
      line.v3 = fieldValues[3 - fieldIndex];
    }
    if (fieldIndex <= 4 && 4 < fieldIndex + fieldValues.length) {
      line.v4 = fieldValues[4 - fieldIndex];
    }
    if (fieldIndex <= 5 && 5 < fieldIndex + fieldValues.length) {
      line.v5 = fieldValues[5 - fieldIndex];
    }

    return this.removePolicyByAdapter(line, filteredPolicies);
  }

  private loadPolicyLine(line: any, model: any) {
    const lineText =
      line.ptype +
      ', ' +
      [line.v0, line.v1, line.v2, line.v3, line.v4, line.v5]
        .filter(n => n)
        .join(', ');
    Helper.loadPolicyLine(lineText, model);
  }

  private savePolicyLine(ptype: string, rule: string[]): AdapterLine {
    const line = new (this.getAdapterLine())();

    line.ptype = ptype;
    if (rule.length > 0) {
      line.v0 = rule[0];
    }
    if (rule.length > 1) {
      line.v1 = rule[1];
    }
    if (rule.length > 2) {
      line.v2 = rule[2];
    }
    if (rule.length > 3) {
      line.v3 = rule[3];
    }
    if (rule.length > 4) {
      line.v4 = rule[4];
    }
    if (rule.length > 5) {
      line.v5 = rule[5];
    }

    return line;
  }

  protected abstract getAdapterLine(): new () => AdapterLine;
  protected abstract loadPolicyByAdapter(): Promise<AdapterLine[]>;
  protected abstract loadPolicyWithFilterByAdapter(
    filter
  ): Promise<AdapterLine[]>;
  protected abstract savePolicyByAdapter(
    policies: AdapterLine[]
  ): Promise<void>;
  protected abstract removePolicyByAdapter(
    removePolicy: AdapterLine,
    newestPolicies?: AdapterLine[]
  ): Promise<void>;
}
