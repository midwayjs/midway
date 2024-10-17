import { Singleton } from '@midwayjs/core';
import { createBullBoard } from '@bull-board/api';
import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';

@Singleton()
export class BullBoardManager {
  private bullBoard: ReturnType<typeof createBullBoard>;

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
