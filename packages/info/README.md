# midwayjs info

Document: [https://midwayjs.org/midway](https://midwayjs.org/midway)

![info](./docs/info.png)
## Usage

in Configuration.ts file

```ts
import * as info from '@midwayjs/info';
import { join } from 'path';

@Configuration({
  imports: [
    info,
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
}

```

in your code file

```ts
// model/user.ts
import { Provider, Controller, Get } from '@midwayjs/decorator';
import { InfoService, InfoValueType } from '@midwayjs/info';

@Provider()
@Controller('/')
export class Photo {

  @Inject()
  infoService: InfoService;

  @Get('/info')
  getMidwayInfo() {
    // return json
    return this.infoService.info();
    // return html
    return this.infoService.info(InfoValueType.HTML);
  }
}
```

## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
