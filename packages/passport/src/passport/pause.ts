/*!
 * pause
 * Copyright(c) 2012 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import { Stream } from 'stream';

/**
 * Pause the data events on a stream.
 *
 * @param {object} stream
 * @public
 */

export function pause(stream: Stream) {
  const events = [];
  const onData = createEventListener('data', events);
  const onEnd = createEventListener('end', events);

  // buffer data
  stream.on('data', onData);

  // buffer end
  stream.on('end', onEnd);

  return {
    end: function end() {
      stream.removeListener('data', onData);
      stream.removeListener('end', onEnd);
    },
    resume: function resume() {
      this.end();

      for (let i = 0; i < events.length; i++) {
        // eslint-disable-next-line prefer-spread
        stream.emit.apply(stream, events[i]);
      }
    },
  };
}

function createEventListener(name, events) {
  return function onEvent() {
    const args = new Array(arguments.length + 1);

    args[0] = name;
    for (let i = 0; i < arguments.length; i++) {
      // eslint-disable-next-line prefer-rest-params
      args[i + 1] = arguments[i];
    }
    events.push(args);
  };
}
