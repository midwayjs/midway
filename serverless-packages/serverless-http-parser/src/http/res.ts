export class HTTPResponse {
  public statusCode = 200;
  public statusMessage;
  public headersSent = false;
  private _headers = {};

  get headers() {
    return this._headers;
  }

  set headers(value) {
    this._headers = value;
  }

  getHeader(field) {
    return this.headers[field.toLowerCase()] || '';
  }

  removeHeader(field) {
    delete this.headers[field.toLowerCase()];
  }

  hasHeader(field) {
    return field.toLowerCase() in this.headers;
  }

  setHeader(name, value) {
    name = name.toLowerCase();
    this.headers[name] = value;
  }
}
