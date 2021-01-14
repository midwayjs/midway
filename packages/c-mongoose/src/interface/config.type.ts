import * as mongoose from 'mongoose';

export type ConfigType = {
  uri: string,
  options: mongoose.ConnectionOptions;
}
