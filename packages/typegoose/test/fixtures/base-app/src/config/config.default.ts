import { DefaultConfig } from '../../../../../src';

export const mongoose: DefaultConfig = {
  uri: 'mongodb://localhost:27017',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "midway_test_db",
  }
}
