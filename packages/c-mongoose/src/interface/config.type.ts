import * as mongoose from 'mongoose';

export type DefaultConfig = {
  uri: string,
  options: mongoose.ConnectionOptions;
}
