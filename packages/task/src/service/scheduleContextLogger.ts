import { MidwayContextLogger } from '@midwayjs/logger';

export class ScheduleContextLogger extends MidwayContextLogger<any> {
  formatContextLabel() {
    const { taskInfo } = this.ctx;
    return `[${taskInfo.type}][${taskInfo.id}][${taskInfo.trigger}]`;
  }
}
