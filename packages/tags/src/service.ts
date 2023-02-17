import { TAG_ERROR } from './error';
import {
  ITagBindOptions,
  ITagDefine,
  ITagDialect,
  ITagDialectInstance,
  ITagItem,
  ITagListInstanceOptions,
  ITagListInstanceTagsOptions,
  ITagListResult,
  ITagOperResult,
  ITagSearchOptions,
  ITagUnBindOptions,
} from './interface';
import { error } from './utils';
export * from './interface';
export * from './error';

export class TagClient {
  private dialect: ITagDialectInstance;

  constructor(dialect: ITagDialect, tagGroup: string) {
    this.dialect = dialect.getInstance(tagGroup);
  }

  async new(tagDefine: ITagDefine) {
    return this.dialect.new(tagDefine);
  }

  async remove(tagIdOrName: number | string): Promise<ITagOperResult> {
    return this.dialect.remove(tagIdOrName);
  }

  async update(
    tagIdOrName: number | string,
    params: Partial<ITagDefine>
  ): Promise<ITagOperResult> {
    return this.dialect.update(tagIdOrName, params);
  }
  async list(
    listOptions?: ITagSearchOptions
  ): Promise<ITagListResult<ITagItem>> {
    return this.dialect.list({
      page: 1,
      pageSize: 20,
      ...listOptions,
    });
  }

  async bind(bindOptions: ITagBindOptions): Promise<ITagOperResult> {
    if (!bindOptions.tags?.length) {
      return error(TAG_ERROR.MISSING_PARAMETERS, { need: 'tags' });
    }
    return this.dialect.bind(bindOptions);
  }

  async unbind(unbindOptions: ITagUnBindOptions): Promise<ITagOperResult> {
    return this.dialect.unbind(unbindOptions);
  }

  async listObjects(
    listOptions?: ITagListInstanceOptions
  ): Promise<ITagListResult<number>> {
    return this.dialect.listObjects({
      page: 1,
      pageSize: 20,
      tags: [],
      ...listOptions,
    });
  }

  async listObjectTags(
    listOptions?: ITagListInstanceTagsOptions
  ): Promise<ITagListResult<ITagItem>> {
    return this.dialect.listObjectTags({
      page: 1,
      pageSize: 20,
      ...listOptions,
    });
  }
}
