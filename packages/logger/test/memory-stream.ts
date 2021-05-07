import { Writable } from 'stream';

export class MemoryStream extends Writable {

  _writableState;

  write(...args) {
    const ret = Writable.prototype.write.apply(this, args);
    if (!ret) {
      this.emit('drain');
    }

    return ret;
  }

  _write(chunk, encoding, callback) {
    this.write(chunk, encoding, callback);
  }

  toString() {
    return this.toBuffer().toString();
  }

  toBuffer() {
    const buffers = [];
    this._writableState.getBuffer().forEach(function (data) {
      buffers.push(data.chunk);
    });

    return Buffer.concat(buffers);
  };

}
