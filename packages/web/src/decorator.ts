import { createCustomPropertyDecorator, saveModule } from '@midwayjs/core';
import { RUN_IN_AGENT_KEY, EGG_AGENT_APP_KEY } from './interface';

export function AgentApp(): PropertyDecorator {
  return createCustomPropertyDecorator(EGG_AGENT_APP_KEY, {});
}

export function RunInEggAgent(): ClassDecorator {
  return function (target: any) {
    saveModule(RUN_IN_AGENT_KEY, target);
  };
}
