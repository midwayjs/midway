import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: {
    bbb: 222,
    ccc: 333,
  },
})
class AutoConfiguration {
}

module.exports = AutoConfiguration;
