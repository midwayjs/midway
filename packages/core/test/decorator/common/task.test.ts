import {
  Task,
  TaskLocal,
  getClassMetadata,
  Queue,
  FORMAT,
  MODULE_TASK_METADATA,
  MODULE_TASK_TASK_LOCAL_OPTIONS,
  MODULE_TASK_QUEUE_OPTIONS,
} from '../../../src';

@Queue()
export class HelloTask {
  async execute(params){
    console.log(params);
  }
}

class CustomFramework {

  @Task({
    repeat: { cron: FORMAT.CRONTAB.EVERY_MINUTE}
  })
  runTask() {}

  @TaskLocal(FORMAT.CRONTAB.EVERY_MINUTE)
  runLocalTask() {}
}


describe('/test/annotation/task.test.ts', () => {
  it('test task decorator', () => {
    const meta = getClassMetadata(MODULE_TASK_METADATA, CustomFramework);
    expect(meta).toMatchSnapshot();

    const meta1 = getClassMetadata(MODULE_TASK_TASK_LOCAL_OPTIONS, CustomFramework);
    expect(meta1).toMatchSnapshot();

    const meta2 = getClassMetadata(MODULE_TASK_QUEUE_OPTIONS, CustomFramework);
    expect(meta2).toMatchSnapshot();
  });
});
