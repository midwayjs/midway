import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, FieldType, SortOrder } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.createSearchIndex({
    tableName: 'nestedTag',// 设置表名
    indexName: 'testIndex',// 设置索引名
    schema: {
      fieldSchemas: [
        {
          fieldName: 'pic_id',
          fieldType: FieldType.KEYWORD,// 设置字段名、类型
          index: true,// 设置开启索引
          enableSortAndAgg: true,// 设置开启排序和统计功能
          store: false,
          isAnArray: false
        },
        {
          fieldName: 'count',
          fieldType: FieldType.LONG,
          index: true,
          enableSortAndAgg: true,
          store: true,
          isAnArray: false
        },
        {
          fieldName: 'time_stamp',
          fieldType: FieldType.LONG,
          index: true,
          enableSortAndAgg: false,
          store: true,
          isAnArray: false,
        },
        {
          fieldName: 'pic_description',
          fieldType: FieldType.TEXT,
          index: true,
          enableSortAndAgg: false,
          store: true,
          isAnArray: false,
        },
        {
          fieldName: 'pos',
          fieldType: FieldType.GEO_POINT,
          index: true,
          enableSortAndAgg: true,
          store: true,
          isAnArray: false,
        },
        {
          fieldName: 'pic_tag',
          fieldType: FieldType.NESTED,
          index: false,
          enableSortAndAgg: false,
          store: false,
          fieldSchemas: [
            {
              fieldName: 'sub_tag_name',
              fieldType: FieldType.KEYWORD,
              index: true,
              enableSortAndAgg: true,
              store: false,
            },
            {
              fieldName: 'tag_name',
              fieldType: FieldType.KEYWORD,
              index: true,
              enableSortAndAgg: true,
              store: false,
            }
          ]
        }
      ],
      indexSetting: {//optional
        'routingFields': ['count', 'pic_id'],//仅支持主键
        'routingPartitionSize': null
      },
      indexSort: {//不支持含含NESTED的索引
        sorters: [
          {//不设置时默认PrimaryKeySort（正序）
            primaryKeySort: {
              order: SortOrder.SORT_ORDER_DESC
            }
          },
          {
            fieldSort: {
              fieldName: 'pic_id',
              order: SortOrder.SORT_ORDER_DESC
            }
          }
        ]
      }
    }
  });

})();
