import { User3 } from '../service/test';

export const mongoose = {
  dataSource: {
    default: {
      uri: 'mongodb://localhost:27017',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "midway_test_db",
      },
      entities: [User3]
    },
    db2: {
      uri: 'mongodb://localhost:27017',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "midway_test_db2",
      }
    },
  }
}
