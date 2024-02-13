import { MySdkService } from "./sdk.service";
import * as assert from 'assert';

export default async agent => {
  const sdkService = await agent.getApplicationContext().getAsync(MySdkService);
  assert.ok(agent.applicationContext);
  assert.ok(sdkService);
  assert.ok(agent.getConfig());
  assert.ok(agent.getEnv());
}
