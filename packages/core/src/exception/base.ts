export class MidwayBaseException extends Error {
  code: number;

  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}
