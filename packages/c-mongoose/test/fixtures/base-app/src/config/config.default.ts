import { ConfigType } from '../../../../../src';

// 此处是用的一个免费的mongodb，可能不是很稳定
export const mongoose: ConfigType = {
  uri: 'mongodb+srv://cluster0.hy9wo.mongodb.net/',
  options: { useNewUrlParser: true, useUnifiedTopology: true, dbName: "midway_test_db", user: "midway_test", pass: '@7XsLUg.F7ga3DMrzqWU' }
}
