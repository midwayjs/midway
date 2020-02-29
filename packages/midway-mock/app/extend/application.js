module.exports = {
  mockClassFunction(className, methodName, fn) {
    console.log('debug1: ', this)
    console.log('debug1: ', this.applicationContext)
    console.log('debug2: ', typeof this.applicationContext.registry)
    const def = this.applicationContext.registry.getDefinition(className);
    if (! def) {
      throw new TypeError(`def undefined with className: "${className}", methodName: "${methodName}"`)
    }
    else {
      const clazz = def.path;
      if (clazz && typeof clazz === 'function') {
        this._mockFn(clazz.prototype, methodName, fn);
      }
    }
  }
};
