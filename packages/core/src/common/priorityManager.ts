import { Provide, Scope } from '../decorator';
import { ScopeEnum } from '../interface';

export const DEFAULT_PRIORITY = {
  L1: 'High',
  L2: 'Medium',
  L3: 'Low',
};

@Provide()
@Scope(ScopeEnum.Singleton)
export class PriorityManager {
  private priorityList: Record<string, string> = DEFAULT_PRIORITY;
  private defaultPriority = DEFAULT_PRIORITY.L2;

  public getCurrentPriorityList() {
    return this.priorityList;
  }

  public getDefaultPriority(): string {
    return this.defaultPriority;
  }

  public isHighPriority(priority = DEFAULT_PRIORITY.L2) {
    return priority === DEFAULT_PRIORITY.L1;
  }
  public isMediumPriority(priority = DEFAULT_PRIORITY.L2) {
    return priority === DEFAULT_PRIORITY.L2;
  }
  public isLowPriority(priority = DEFAULT_PRIORITY.L2) {
    return priority === DEFAULT_PRIORITY.L3;
  }

  public getPriority(priority: string) {
    return priority || this.getDefaultPriority();
  }
}
