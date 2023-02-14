import {
  ILifeCycle,
  Configuration,
  Provide,
  ServerlessTrigger,
  ServerlessTriggerType,
  ServerlessFunction
} from '../../../../src';
@Configuration({
})
export class ContainerLifeCycle implements ILifeCycle {

  async onReady() {}
}

@Provide()
export class LocalTest {
  @ServerlessTrigger(ServerlessTriggerType.EVENT, {
    functionName: 'aaa1'
  })
  async hello1() {
    return 'test ';
  }

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  async hello2() {
    return 'test ';
  }

  @ServerlessFunction({
    functionName: 'aaa3'
  })
  @ServerlessTrigger(ServerlessTriggerType.MTOP)
  async hello3() {
    return 'test ';
  }

  @ServerlessFunction({
    functionName: 'aaa4'
  })
  @ServerlessTrigger(ServerlessTriggerType.SSR, {
    functionName: 'aaab4'
  })
  async hello4() {
    return 'test ';
  }
}
