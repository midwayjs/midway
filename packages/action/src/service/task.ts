import { Provide, Inject } from '@midwayjs/decorator';
import { DataTableName } from '../internal/constants';
import { ActionDataProvider } from '../internal/dataProvider';
@Provide()
export class ActionTaskService {
  @Inject()
  data: ActionDataProvider;

  // 新增任务
  async new(pipelineId: number, baseInfo: any): Promise<number> {
    return this.data.insert(DataTableName.Task, {
      pipelineId,
      baseInfo,
      status: 'wait',
    });
  }

  // 取消任务
  async cancel(taskId: number): Promise<boolean> {
    console.log('taskId', taskId);
    return true;
  }

  // 获取任务状态
  async status(taskId: number) {
    console.log('taskId', taskId);
    return false;
  }
}
