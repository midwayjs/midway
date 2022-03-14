import { MySdkService } from "./sdk.service";
import * as assert from 'assert';

export default async agent => {
  const sdkService = await agent.getApplicationContext().getAsync(MySdkService);
  assert(agent.applicationContext);
  assert(sdkService);
  assert(agent.getConfig);
}
