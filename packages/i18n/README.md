# midway i18n Component

## Install

```bash
$ npm i @midwayjs/i18n --save
```

## Usage

add component in your configuration.

```ts
import * as koa from '@midwayjs/koa';
import * as i18n from '@midwayjs/i18n';

@Configuratino({
  imports: [
    koa,
    i18n
  ]
})
```

You can use `translate` method to translate your message.

```ts
@Controller('/')
export class UserController {

  @Inject()
  i18nService: MidwayI18nService;

  @Get('/')
  async index(@Query('username') username: string) {
    return this.i18nService.translate('HELLO_MESSAGE', {
      args: {
        username
      },
    });
  }
}

```

## Default Config

```ts
// config/config.default.js
export const i18n = {
  // default locale  "en_US"
  defaultLocale: 'en_US',

  // your can put your translate message here
  localeTable: {
    en_US: {
      // group name
      default: {
        // hello: 'hello'
      }
    },
    zh_CN: {
      // group name
      default: {
        // hello: '你好'
      }
    },
    fallbacks: {
      //   'en_*': 'en_US',
      //   pt: 'pt-BR',
    },
    writeCookie: true,
    resolver: {
      // URL parameter，default is "locale"
      queryField: 'locale',
      // Header key, default is "locale"
      headerField: 'locale',
      cookieField: {
        fieldName: 'locale',
        // Cookie domain，default is empty，valid in current domain
        cookieDomain: '',
        // Default validity period, one year.
        cookieMaxAge: FORMAT.MS.ONE_YEAR,
      },
    },
  },
};
```

## Message Format

Support Object and Array.

**Object**

```ts
this.i18nService.translate('HELLO_MESSAGE {username}', {
  args: {
    username
  },
});
```

**Array**

```ts
this.i18nService.translate('HELLO_MESSAGE {0} {1}', {
  args: ['harry', 'chen'],
});
```

## Web locale Setting

In the egg/koa/express/faas, current locale will be obtained based on query, header, and cookie.


## Locale Text

| locale             | locale Text |
| :--------------- | :------- |
| 阿拉伯           | ar_EG    |
| 亞美尼亞         | hy_AM    |
| 保加利亚语       | bg_BG    |
| 加泰罗尼亚语     | ca_ES    |
| 捷克语           | cs_CZ    |
| 丹麦语           | da_DK    |
| 德语             | de_DE    |
| 希腊语           | el_GR    |
| 英语             | en_GB    |
| 英语（美式）     | en_US    |
| 西班牙语         | es_ES    |
| 爱沙尼亚语       | et_EE    |
| 波斯语           | fa_IR    |
| 芬兰语           | fi_FI    |
| 法语（比利时）   | fr_BE    |
| 法语             | fr_FR    |
| 希伯来语         | he_IL    |
| 印地语           | hi_IN    |
| 克罗地亚语       | hr_HR    |
| 匈牙利           | hu_HU    |
| 冰岛语           | is_IS    |
| 印度尼西亚语     | id_ID    |
| 意大利语         | it_IT    |
| 日语             | ja_JP    |
| 格鲁吉亚语       | ka_GE    |
| 卡纳达语         | kn_IN    |
| 韩语/朝鲜语      | ko_KR    |
| 库尔德语         | ku_IQ    |
| 拉脱维亚语       | lv_LV    |
| 马来语           | ms_MY    |
| 蒙古语           | mn_MN    |
| 挪威             | nb_NO    |
| 尼泊尔语         | ne_NP    |
| 荷兰语（比利时） | nl_BE    |
| 荷兰语           | nl_NL    |
| 波兰语           | pl_PL    |
| 葡萄牙语(巴西)   | pt_BR    |
| 葡萄牙语         | pt_PT    |
| 斯洛伐克语       | sk_SK    |
| 塞尔维亚         | sr_RS    |
| 斯洛文尼亚       | sl_SI    |
| 瑞典语           | sv_SE    |
| 泰米尔语         | ta_IN    |
| 泰语             | th_TH    |
| 土耳其语         | tr_TR    |
| 罗马尼亚语       | ro_RO    |
| 俄罗斯语         | ru_RU    |
| 乌克兰语         | uk_UA    |
| 越南语           | vi_VN    |
| 简体中文         | zh_CN    |
| 繁体中文         | zh_TW    |

## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
