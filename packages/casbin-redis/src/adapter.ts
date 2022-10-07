import { FilteredAdapter, Helper, Model } from 'casbin';
import {
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import * as casbin from '@midwayjs/casbin';
import { Filters, RedisAdapterConfig } from './interface';
import { RedisService, RedisServiceFactory } from '@midwayjs/redis';

class Line {
  ptype = '';
  v0 = '';
  v1 = '';
  v2 = '';
  v3 = '';
  v4 = '';
  v5 = '';
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class NodeRedisAdapter implements FilteredAdapter {
  private redisInstance: RedisService;
  private policies: Line[];
  private filtered = false;

  @Inject()
  protected redisServiceFactory: RedisServiceFactory;

  @Inject()
  protected casbinAdapterManager: casbin.CasbinAdapterManager;

  @Config('casbinRedis')
  protected adapterConfig: RedisAdapterConfig;

  @Init()
  protected async init() {
    if (!this.redisServiceFactory.has(this.adapterConfig.clientName)) {
      this.redisInstance = (await this.redisServiceFactory.createInstance(
        this.adapterConfig.clientOption,
        this.adapterConfig.clientName
      )) as RedisService;
    } else {
      this.redisInstance = this.redisServiceFactory.get(
        this.adapterConfig.clientName
      );
    }
  }

  public isFiltered(): boolean {
    return this.filtered;
  }

  //Helper Methods
  savePolicyLine(ptype: any, rule: any) {
    const line = new Line();
    line.ptype = ptype;
    switch (rule.length) {
      case 6:
        line.v5 = rule[5];
        break;
      case 5:
        line.v4 = rule[4];
        break;
      case 4:
        line.v3 = rule[3];
        break;
      case 3:
        line.v2 = rule[2];
        break;
      case 2:
        line.v1 = rule[1];
        break;
      case 1:
        line.v0 = rule[0];
        break;
      default:
        throw new Error(
          'Rule should not be empty or have more than 6 arguments.'
        );
    }
    return line;
  }

  loadPolicyLine(line: any, model: any) {
    //console.log("Load policies line called")
    const lineText =
      line.ptype +
      ', ' +
      [line.v0, line.v1, line.v2, line.v3, line.v4, line.v5]
        .filter(n => n)
        .join(', ');
    // console.log(lineText)
    Helper.loadPolicyLine(lineText, model);
  }

  storePolicies(policies: Line[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisInstance.del('policies');
      this.redisInstance.set(
        'policies',
        JSON.stringify(policies),
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  public async loadFilteredPolicy(
    model: Model,
    policyFilter: Filters
  ): Promise<void> {
    return await new Promise((resolve, reject) => {
      this.redisInstance.get('policies', (err, policies) => {
        if (!err) {
          const parsedPolicies = JSON.parse(policies!);
          const filteredPolicies = parsedPolicies.filter((policy: Line) => {
            if (!(policy.ptype in policyFilter)) {
              return false;
            }
            const tempPolicy = [
              policy.v0,
              policy.v1,
              policy.v2,
              policy.v3,
              policy.v4,
              policy.v5,
            ];
            const tempFilter = policyFilter[policy.ptype];
            if (tempFilter.length > tempPolicy.length) {
              return false;
            }
            for (let i = 0; i < tempFilter.length; i++) {
              if (!tempFilter[i]) {
                continue;
              }
              if (tempPolicy[i] !== tempFilter[i]) {
                return false;
              }
            }
            return true;
          });
          filteredPolicies.forEach((policy: any) => {
            this.loadPolicyLine(policy, model);
          });
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  // Adapter Methods
  public async loadPolicy(model: Model): Promise<void> {
    return await new Promise((resolve, reject) => {
      this.redisInstance.get('policies', (err, policies) => {
        if (!err) {
          const parsedPolicies = JSON.parse(policies!) ?? [];
          this.policies = parsedPolicies; // for adding and removing policies methods
          parsedPolicies.forEach((policy: any) => {
            this.loadPolicyLine(policy, model);
          });
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  public async savePolicy(model: Model): Promise<boolean> {
    const policyRuleAST = model.model.get('p')!;
    const groupingPolicyAST = model.model.get('g')!;
    const policies: Line[] = [];

    //console.log(policyRuleAST)

    for (const astMap of [policyRuleAST, groupingPolicyAST]) {
      for (const [ptype, ast] of astMap) {
        for (const rule of ast.policy) {
          const line = this.savePolicyLine(ptype, rule);
          policies.push(line);
        }
      }
    }

    return new Promise((resolve, reject) => {
      this.redisInstance.del('policies');
      this.redisInstance.set(
        'policies',
        JSON.stringify(policies),
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  async addPolicy(sec: string, ptype: string, rule: any) {
    const line = this.savePolicyLine(ptype, rule);
    this.policies.push(line);
    await this.storePolicies(this.policies);
    // resave the policies
  }

  async removePolicy(
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
    return await this.storePolicies(filteredPolicies);
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
    return await this.storePolicies(filteredPolicies);
  }
}
