# Midway Information Component

Show your project info in router or other way, like phpInfo.

![info](https://img.alicdn.com/imgextra/i3/O1CN01TCkSvr28x8T7gtnCl_!!6000000007998-2-tps-797-1106.png)

## Usage

import info component in `configuration.ts` file

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

Your can curl `/_info` to show it.

## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
