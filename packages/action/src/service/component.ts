import { Provide, Inject } from '@midwayjs/decorator';
import { IComponentConfig } from '../interface';
import { DataTableName } from '../internal/constants';
import { ActionDataProvider } from '../internal/dataProvider';
@Provide()
export class ActionComponentService {
  @Inject()
  data: ActionDataProvider;
  // 新增 component
  async new(config: IComponentConfig) {
    return this.data.insert(DataTableName.Component, config);
  }
}
