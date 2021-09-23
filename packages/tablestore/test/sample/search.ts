import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, SortOrder, ColumnReturnType, Long, QueryType, QueryOperator, SortMode, GeoDistanceType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  const testQueryMap = {
    MATCH_QUERY: {//1
      queryType: QueryType.MATCH_QUERY,
      query: {
        fieldName: "pic_id",
        text: "pic_id_5"
      }
    },
    MATCH_QUERY_OR: {//1
      queryType: QueryType.MATCH_QUERY,
      query: {
        fieldName: "pic_description",
        text: "some info",
        minimumShouldMatch: 2,
        operator: QueryOperator.OR
      }
    },
    MATCH_PHRASE_QUERY: {//2
      queryType: QueryType.MATCH_PHRASE_QUERY,
      query: {
        fieldName: "pic_id",
        text: "pic_id_5"
      }
    },
    TERM_QUERY: {//3
      queryType: QueryType.TERM_QUERY,
      query: {
        fieldName: "pic_id",
        term: "pic_id_5"
      }
    },
    RANGE_QUERY: {//4
      queryType: QueryType.RANGE_QUERY,
      query: {
        fieldName: "pic_id",
        rangeFrom: "pic_id_10",
        includeLower: true,
        rangeTo: "pic_id_11",
        includeUpper: true,
      }
    },
    PREFIX_QUERY: {//5
      queryType: QueryType.PREFIX_QUERY,
      query: {
        fieldName: "pic_id",
        prefix: "pic_id_2"
      }
    },
    BOOL_QUERY: {//6
      queryType: QueryType.BOOL_QUERY,
      query: {
        mustQueries: [
          {
            queryType: QueryType.PREFIX_QUERY,
            query: {
              fieldName: "pic_id",
              prefix: "pic_id_"
            }
          },
          {
            queryType: QueryType.RANGE_QUERY,
            query: {
              fieldName: "pic_id",
              rangeFrom: "pic_id_0",
              includeLower: true,
              rangeTo: "pic_id_20",
              includeUpper: true,
            }
          }
        ],
        mustNotQueries: [
          {
            queryType: QueryType.PREFIX_QUERY,
            query: {
              fieldName: "pic_id",
              prefix: "pic_id_24"
            }
          },
          {
            queryType: QueryType.RANGE_QUERY,
            query: {
              fieldName: "pic_id",
              rangeFrom: "pic_id_10",
              includeLower: true,
              // rangeTo: "pic_id_20",
              // includeUpper: true,
            }
          },
        ],
        filterQueries: [
          {
            queryType: QueryType.PREFIX_QUERY,
            query: {
              fieldName: "pic_id",
              prefix: "pic_id_"
            }
          },
          {
            queryType: QueryType.RANGE_QUERY,
            query: {
              fieldName: "pic_id",
              rangeFrom: "pic_id_0",
              includeLower: true,
              rangeTo: "pic_id_20",
              includeUpper: true,
            }
          }
        ],
        shouldQueries: [
          {
            queryType: QueryType.PREFIX_QUERY,
            query: {
              fieldName: "pic_id",
              prefix: "pic_id_2"
            }
          },
          {
            queryType: QueryType.RANGE_QUERY,
            query: {
              fieldName: "pic_id",
              rangeFrom: "pic_id_18",
              includeLower: true,
              rangeTo: "pic_id_20",
              includeUpper: true,
            }
          }
        ],
        minimumShouldMatch: 0
      }

    },
    CONST_SCORE_QUERY: {//7
      queryType: QueryType.CONST_SCORE_QUERY,
      query: {
        filter: {
          queryType: QueryType.PREFIX_QUERY,
          query: {
            fieldName: "pic_id",
            prefix: "pic_id_21"
          }
        }
      }
    },
    FUNCTION_SCORE_QUERY: {//8
      queryType: QueryType.FUNCTION_SCORE_QUERY,
      query: {
        query: {
          queryType: QueryType.PREFIX_QUERY,
          query: {
            fieldName: "pic_id",
            prefix: "pic_id_"
          }
        },
        fieldValueFactor: {
          fieldName: "time_stamp"//数值字段
        }
      }
    },
    NESTED_QUERY: {//9
      queryType: QueryType.NESTED_QUERY,
      query: {
        path: "pic_tag",
        query: {
          queryType: QueryType.MATCH_ALL_QUERY,
          query: {
            fieldName: "pic_tag.tag_name",
            term: "车"
          }
        },
      }
    },
    WILDCARD_QUERY: {//10
      queryType: QueryType.WILDCARD_QUERY,
      query: {
        fieldName: "pic_id",
        value: "pic_id_*1"
      }
    },
    MATCH_ALL_QUERY: {//11
      queryType: QueryType.MATCH_ALL_QUERY,
    },
    GEO_BOUNDING_BOX_QUERY: {//12
      queryType: QueryType.GEO_BOUNDING_BOX_QUERY,
      query: {
        fieldName: "pos",
        topLeft: "1,0", // 设置矩形左上角(纬度,经度)
        bottomRight: "0,1"  // 设置矩形右下角(纬度,经度)
      }
    },
    GEO_DISTANCE_QUERY: {//13
      queryType: QueryType.GEO_DISTANCE_QUERY,
      query: {
        fieldName: "pos",
        centerPoint: "1,1",// 设置中心点
        distance: 200000//单位米
      }
    },
    GEO_POLYGON_QUERY: {//14
      queryType: QueryType.GEO_POLYGON_QUERY,
      query: {
        fieldName: "pos",
        points: ["0,0", "0,1", "-1,-1", "1,0"]
      }
    },
    TERMS_QUERY: {//15
      queryType: QueryType.TERMS_QUERY,
      query: {
        fieldName: "pic_id",
        terms: ["pic_id_1", "pic_id_5"]
      }
    },
    EXISTS_QUERY: {//16
      queryType: QueryType.EXISTS_QUERY,
      query: {
        fieldName: "pic_id"
      }
    }
  };

  await tableStoreService.search({
    tableName: "nestedTag",
    indexName: "testIndex",
    searchQuery: {
      offset: 0,
      limit: 10,
      query: testQueryMap.NESTED_QUERY,
      getTotalCount: true,
      sort: {
        sorters: [
          {
            fieldSort: {
              fieldName: "count",
              order: SortOrder.SORT_ORDER_DESC,
              mode: SortMode.SORT_MODE_AVG,//for nested
              nestedFilter: {
                path: "pic_tag",
                filter: {
                  queryType: QueryType.MATCH_ALL_QUERY,
                }
              },
            },
            scoreSort: {
              order: SortOrder.SORT_ORDER_ASC
            },
            geoDistanceSort: {
              fieldName: 'pos',
              points: ['0,0'],
              order: SortOrder.SORT_ORDER_ASC,
              distanceType: GeoDistanceType.GEO_DISTANCE_ARC,
              mode: SortMode.SORT_MODE_MIN,
              nestedFilter: {
                path: 'pos',
                filter: {
                  queryType: QueryType.MATCH_ALL_QUERY,
                }
              },
            }
          }
        ]
      }
    },
    columnToGet: {
      returnType: ColumnReturnType.RETURN_NONE,
      returnNames: ["pic_tag", "pic_description", "time_stamp", "pos"]
    },
    routingValues: [
      [{count: Long.fromNumber(0), pic_id: "pic_id_0"}],//pk顺序与创建index时routingFields一致
      [{count: Long.fromNumber(3), pic_id: "pic_id_3"}],
    ]
  });

})();
