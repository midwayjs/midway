module.exports = {
  mockClassFunction(className, methodName, fn) {
    const def = this.applicationContext.registry.getDefinition(className);
    const clazz = def.path;
    if (clazz && typeof clazz === 'function') {
      this._mockFn(clazz.prototype, methodName, fn);
    }
  }
};