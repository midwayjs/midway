import { performance } from 'perf_hooks';

let enabled = true;

export function mark(name: string) {
  if (!enabled) {
    return;
  }
  performance.mark(name);
}

export function disable() {
  enabled = false;
}

export default {
  mark,
  measure: performance.measure.bind(performance),
  disable,
};
