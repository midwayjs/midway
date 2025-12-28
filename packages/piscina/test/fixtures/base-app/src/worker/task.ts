import { IPiscinaTask, PiscinaTask } from '../../../../../src';

/**
 * 计算任务
 */
@PiscinaTask('calculate')
export class CalculateTask implements IPiscinaTask {
  async execute(payload: { a: number; b: number; operation: 'multiply' | 'add' }) {
    const { a = 0, b = 0, operation = 'multiply' } = payload || {};
    
    if (operation === 'multiply') {
      return a * b;
    } else {
      return a + b;
    }
  }
}

/**
 * 平方任务
 */
@PiscinaTask('square')
export class SquareTask implements IPiscinaTask {
  async execute(payload: { value: number }) {
    const { value = 0 } = payload || {};
    return value * value;
  }
}
