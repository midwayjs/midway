import { saveClassMetadata, saveModule, scope, ScopeEnum } from 'injection';
import { SCHEDULE_KEY } from '../constant';

export interface CommonSchedule {
  exec(ctx?);
}

export interface ScheduleOpts {
  type: string;
  cron?: string;
  interval?: number | string;
  immediate?: boolean;
  disable?: boolean;
  env?: [string];
  cronOptions?: {
    currentDate?: string | number | Date
    startDate?: string | number | Date
    endDate?: string | number | Date
    iterator?: boolean
    utc?: boolean
    tz?: string
  };
}

export function schedule(scheduleOpts: ScheduleOpts | string) {
  return function (target: any): void {
    saveModule(SCHEDULE_KEY, target);
    saveClassMetadata(SCHEDULE_KEY, scheduleOpts, target);
    scope(ScopeEnum.Request)(target);
  };
}
