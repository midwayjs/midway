export class ContextFilterManager extends Array {

  public insertFirst(filter) {
    this.unshift(filter);
  }

  public insertBefore(idx: number | string, filter) {
    if (idx === 'string') {
      idx = this.indexOf(idx);
    }
    this.splice(idx as number, 0, filter);
  }

  public insertAfter(idx: number | string, filter) {
    if (idx === 'string') {
      idx = this.indexOf(idx);
    }
    this.splice(idx as number + 1, 0, filter);
  }

  public insertLast(filter) {
    this.push(filter);
  }
}
