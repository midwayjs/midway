import {
  ApplicationContext,
  Config,
  IMidwayContainer,
  Init,
  Inject,
  MidwayFrameworkService,
  Singleton,
} from '@midwayjs/core';
import { createBullBoard } from '@bull-board/api';
import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';
import type { Framework as BullFramework } from '@midwayjs/bull';
import type { Framework as BullMQFramework } from '@midwayjs/bullmq';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { MidwayAdapter } from './adapter';
import { BullBoardOption } from './interface';

@Singleton()
export class BullBoardManager {
  private bullBoard: ReturnType<typeof createBullBoard>;

  @Config('bullBoard')
  protected bullBoardConfig: BullBoardOption;

  @Inject()
  protected frameworkService: MidwayFrameworkService;

  @ApplicationContext()
  protected applicationContext: IMidwayContainer;

  private basePath: string;
  private serverAdapter: MidwayAdapter;

  @Init()
  protected async init() {
    let framework: BullFramework | BullMQFramework =
      this.frameworkService.getFramework('bull') as BullFramework;
    if (!framework) {
      framework = this.frameworkService.getFramework(
        'bullmq'
      ) as BullMQFramework;
    }

    if (!framework) {
      return;
    }

    const queueList = framework.getQueueList();
    const wrapQueues = queueList.map(queue => {
      if (this.applicationContext.hasNamespace('bull')) {
        return new BullAdapter(queue) as any;
      } else if (this.applicationContext.hasNamespace('bullmq')) {
        return new BullMQAdapter(queue) as any;
      }
    });
    this.basePath = this.bullBoardConfig.basePath;

    this.serverAdapter = new MidwayAdapter();
    this.bullBoard = createBullBoard({
      queues: wrapQueues,
      serverAdapter: this.serverAdapter,
      options: {
        uiConfig: this.bullBoardConfig.uiConfig,
      },
    });
    this.serverAdapter.setBasePath(this.basePath);
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public getServerAdapter(): MidwayAdapter {
    return this.serverAdapter;
  }

  public setBullBoard(bullBoard: ReturnType<typeof createBullBoard>) {
    this.bullBoard = bullBoard;
  }

  public getBullBoardOrigin(): ReturnType<typeof createBullBoard> {
    return this.bullBoard;
  }

  public addQueue(queue: BaseAdapter) {
    this.bullBoard.addQueue(queue);
  }

  public removeQueue(queueOrName: string | BaseAdapter) {
    this.bullBoard.removeQueue(queueOrName);
  }

  public replaceQueues(newBullQueues: readonly BaseAdapter[]) {
    this.bullBoard.replaceQueues(newBullQueues);
  }

  public setQueues(newBullQueues: readonly BaseAdapter[]) {
    this.bullBoard.setQueues(newBullQueues);
  }
}
