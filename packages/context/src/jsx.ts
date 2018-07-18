declare namespace JSX {
  interface IntrinsicElements {
    objects: {
      external?: boolean,
      path?: string,
      autowire?: boolean,
      direct?: boolean
    };
    object: {
      external?: boolean,       // 是否node module
      path?: string,            // 路径
      autowire?: boolean,       // 是否自动装配
      direct?: boolean,         // 是否直接require
      async?: boolean,          // 是否异步
      initMethod?: string,      // 初始化方法
      destroyMethod?: string,   // 销毁方法
      constructMethod?: string, // 创建实例方法
      id?: string               // 唯一id
    };
    json: {};
    constructorArg: {};
    ref: {
      object: string
    };
    property: {
      name: string,
      ref?: string,
      value?: string,
      type?: string
    };
    props: {};
    prop: {
      key: string,
      value?: string,
      type?: string
    };
    set: {};
    list: {};
    value: {
      type?: string
    };
    map: {};
    entry: {
      key: string,
      value?: string,
      type?: string
    };
    import: {
      resource?: string,
      external?: boolean
    };
    configuration: {
      path: string,
      external?: boolean
    };
    aspect: {
      path: string,
      external?: boolean
    };
    around: {
      expression: string,
      execute: string
    };
  }
}
