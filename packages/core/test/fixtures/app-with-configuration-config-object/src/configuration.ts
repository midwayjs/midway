import { Configuration } from '../../../../src';

@Configuration({
  importConfigs: {
    bbb: 222,
    ccc: 333,
  },
})
class AutoConfiguration {
}

module.exports = AutoConfiguration;
