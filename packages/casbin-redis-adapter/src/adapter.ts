import { RedisService } from '@midwayjs/redis';
import { BaseAdapter } from '@midwayjs/casbin';

class Line {
  ptype = '';
  v0 = '';
  v1 = '';
  v2 = '';
  v3 = '';
  v4 = '';
  v5 = '';
}

export class NodeRedisAdapter extends BaseAdapter<Line> {
  private redisInstance: RedisService;

  constructor(redisInstance) {
    super();
    this.redisInstance = redisInstance;
  }

  protected getAdapterLine(): new () => Line {
    return Line;
  }
  protected async loadPolicyByAdapter(): Promise<Line[]> {
    const policies = await this.redisInstance.get('policies');
    return JSON.parse(policies!) ?? [];
  }
  protected async loadPolicyWithFilterByAdapter(
    policyFilter: any
  ): Promise<Line[]> {
    const policies = await this.redisInstance.get('policies');
    const parsedPolicies = JSON.parse(policies!);
    return parsedPolicies.filter((policy: Line) => {
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
  }
  protected async savePolicyByAdapter(policies: Line[]): Promise<void> {
    await this.redisInstance.del('policies');
    await this.redisInstance.set('policies', JSON.stringify(policies));
  }
  protected async removePolicyByAdapter(
    removePolicy: Line,
    newestPolicies?: Line[]
  ): Promise<void> {
    await this.redisInstance.del('policies');
    await this.redisInstance.set('policies', JSON.stringify(newestPolicies));
  }
}
