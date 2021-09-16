import { Configuration } from '@midwayjs/decorator';
import path = require('path');
const abPath = path.resolve(path.join(__dirname, './config/config.default'));
@Configuration({
  namespace: 'midway-plugin-no-pkg-json',
  importConfigs: [
    abPath,
    path.join(__dirname, './config/config.local')
  ]
})
export class AutoConfiguration {}
