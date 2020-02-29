module.exports = {
  mockClassFunction(className, methodName, fn) {
    console.log('mockClassFunction:', this)
    console.log('mockClassFunction:', typeof this.applicationContext.registry)
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


// function mockClassFunction(className, methodName, fn) {
//     const def = this.applicationContext.registry.getDefinition(className);
//     if (! def) {
//       throw new TypeError(`def undefined with className: "${className}", methodName: "${methodName}"`)
//     }
//     else {
//       const clazz = def.path;
//       if (clazz && typeof clazz === 'function') {
//         this._mockFn(clazz.prototype, methodName, fn);
//       }
//     }
//   }

// exports.mockClassFunction = mockClassFunction
