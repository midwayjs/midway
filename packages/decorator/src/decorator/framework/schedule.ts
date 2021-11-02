import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  SCHEDULE_KEY,
  Provide,
} from '../../';
import { Scope } from '../common/objectDef';

export interface CommonSchedule {
  exec(ctx?);
}

export interface ScheduleOpts {
  type: string;
  cron?: string;
  interval?: number | string;
  immediate?: boolean;
  disable?: boolean;
  env?: string[];
  cronOptions?: {
    currentDate?: string | number | Date;
    startDate?: string | number | Date;
    endDate?: string | number | Date;
    iterator?: boolean;
    utc?: boolean;
    tz?: string;
  };
}

export function Schedule(scheduleOpts: ScheduleOpts | string) {
  return function (target: any): void {
    saveModule(SCHEDULE_KEY, target);
    saveClassMetadata(SCHEDULE_KEY, scheduleOpts, target);
    Scope(ScopeEnum.Request)(target);
    Provide()(target);
  };
}
