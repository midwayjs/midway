import { Consumer, MSListenerType, RabbitMQListener } from '@midwayjs/decorator'

@Consumer(MSListenerType.RABBITMQ)
export class UserConsumer {

  @RabbitMQListener('tasks')
  @RabbitMQListener('tasks2')
  async gotData() {

  }

  @RabbitMQListener('tasks1')
  async gotData2() {

  }
}
