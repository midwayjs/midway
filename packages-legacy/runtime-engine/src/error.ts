export class RuntimeError extends Error {
  name = 'RuntimeError';
  code = 1;

  constructor(message: string, errName?: string, code?: number) {
    super(message);
    this.name = errName || this.constructor.name;
    this.code = code || 1;
  }

  static create(errorObject: { name?: string; code: number; message: string }) {
    let errName = errorObject.name || 'RuntimeError';
    if (!/Error$/.test(errName)) {
      errName += 'Error';
    }
    return new RuntimeError(errorObject.message, errName, errorObject.code);
  }
}
