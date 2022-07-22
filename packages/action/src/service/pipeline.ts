import { Provide, Inject } from '@midwayjs/decorator';
import { DataTableName } from '../internal/constants';
import { ActionDataProvider } from '../internal/dataProvider';
@Provide()
export class ActionPipelineService {
  @Inject()
  data: ActionDataProvider;
  // 新增pipeline
  async new(pipelineConfig: any) {
    return this.data.insert(DataTableName.Pipeline, pipelineConfig);
  }
}
