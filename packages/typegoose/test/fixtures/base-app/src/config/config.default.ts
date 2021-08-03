import { DefaultConfig } from '../../../../../src';

// 此处是用的一个免费的mongodb，可能不是很稳定
export const mongoose: DefaultConfig = {
  uri: process.env.MONGO_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "midway_test_db",
  }
}
