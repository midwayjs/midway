import { findAndParseTsConfig } from '@midwayjs/mwcc';

let ts;
interface IOptions {
  baseDir: string;
  sourceDir: string | string[];
  spec?: any;
}

class CodeAnalysis {
  options: IOptions;
  spec: any;
  checker: any;
  constructor(options: IOptions) {
    this.options = options;
  }

  async start() {
    this.loadSpec();

    const parsedCli = findAndParseTsConfig(
      this.options.baseDir,
      /** outDir */ undefined,
      /** configName */ undefined,
      /** hintConfig */ undefined,
      /** overrideConfig */ {
        include: [].concat(this.options.sourceDir),
        compilerOptions: {
          rootDir: '',
        },
      }
    );
    const compilerOptions = parsedCli.options;
    const program = ts.createProgram(parsedCli.fileNames, compilerOptions);
    this.checker = program.getTypeChecker();
    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        ts.forEachChild(sourceFile, this.visit.bind(this));
      }
    }
    return this.spec;
  }

  // 分析函数
  loadSpec() {
    this.spec = this.options.spec || {};
    if (!this.spec.functions) {
      this.spec.functions = {};
    }
  }

  // 遍历文件
  visit(node) {
    if (ts.isClassDeclaration(node) && node.name) {
      if (!node.decorators) {
        return;
      }
      const decoratorsInfo: any = { type: {}, list: [] };
      node.decorators.forEach(decorator => {
        this.getDecoratorInfo(decoratorsInfo, decorator);
      });
      if (!decoratorsInfo.type.Provide) {
        return;
      }
      // 获取对应node所在的代码
      const symbol = this.checker.getSymbolAtLocation(node.name);

      if (!symbol) {
        return;
      }

      decoratorsInfo.list.forEach(deco => {
        this.addToFunc(deco, symbol.escapedName);
      });

      if (!symbol.members) {
        return;
      }
      this.getHandlerFunc(symbol);
    }
  }

  // 获取装饰器信息
  getDecoratorInfo(decoratorsInfo, decorator) {
    if (ts.isCallExpression(decorator.expression)) {
      const expression: any = decorator.expression;
      if (!expression.expression) {
        return;
      }
      let args = [];
      if (expression.arguments && expression.arguments.length) {
        args = this.formatArgs(expression.arguments);
      }
      const type = expression.expression.escapedText;
      decoratorsInfo.type[type] = true;
      decoratorsInfo.list.push({ type, args });
    }
  }

  // 格式化装饰器参数
  formatArgs(args) {
    return args.map(arg => {
      if (arg.name) {
        return arg.name.escapedText;
      }
      if (arg.text) {
        return arg.text;
      }
      if (arg.symbol) {
        const symbol = this.getParam(arg.symbol);
        return symbol;
      }
      return '';
    });
  }

  getHandlerFunc(symbol) {
    symbol.members.forEach(member => {
      const decoratorsInfo: any = { type: {}, list: [] };
      if (
        member.valueDeclaration &&
        member.valueDeclaration.decorators &&
        member.valueDeclaration.decorators.length
      ) {
        member.valueDeclaration.decorators.forEach(decorator => {
          this.getDecoratorInfo(decoratorsInfo, decorator);
        });
      }
      decoratorsInfo.list.forEach(deco => {
        this.addToFunc(deco, symbol.escapedName, member.escapedName);
      });
    });
  }

  addToFunc(deco, className, funcName = 'handler') {
    if (deco.type !== 'Func') {
      return;
    }
    const args = deco.args;
    let handler;
    let trigger: any;
    if (typeof args[0] === 'string') {
      handler = args[0];
      trigger = args[1];
    } else {
      handler = `${this.formatUpperCamel(className)}.${this.formatUpperCamel(
        funcName
      )}`;
      trigger = args[0];
    }

    const funName = handler.replace(/\.handler$/, '').replace(/\./g, '-');

    const existsFuncData = this.spec.functions[funName] || {};
    existsFuncData.handler = handler;
    const events = existsFuncData.events || [];

    if (!trigger) {
      trigger = {
        event: 'http',
      };
    }

    if (trigger.event) {
      const eventType = trigger.event.toLowerCase();
      const event: any = { [eventType]: true };
      if (trigger.event.toLowerCase() === 'http') {
        event[eventType] = {
          method: (trigger.method || 'GET').toUpperCase(),
          path:
            trigger.path ||
            `/${this.firstCharLower(className)}/${this.firstCharLower(
              funcName
            )}`,
        };
      }
      // 防止有重复的触发器
      const currentEventKey = this.getEventKey(eventType, event[eventType]);
      const isExists = events.find(event => {
        if (event[eventType]) {
          const key = this.getEventKey(eventType, event[eventType]);
          return key === currentEventKey;
        }
      });
      if (!isExists) {
        events.push(event);
      }
    }
    existsFuncData.events = events;
    this.spec.functions[funName] = existsFuncData;
  }

  getEventKey(type, event) {
    if (type === 'http') {
      return `${event.method || ''}:${event.path || ''}`;
    }
    return type;
  }

  // 获取参数
  getParam(symbol) {
    const type = this.getType(symbol);
    const valueDeclaration: any = symbol.valueDeclaration as any;
    if (type === 'string') {
      if (valueDeclaration.initializer) {
        if (valueDeclaration.initializer.text) {
          return valueDeclaration.initializer.text;
        } else if (valueDeclaration.initializer.name) {
          return valueDeclaration.initializer.name.escapedText;
        }
        return '';
      }
    }
    const param: any = {};
    if (symbol.members) {
      symbol.members.forEach((value, key) => {
        param[key as string] = this.getParam(value);
      });
    }
    return param;
  }

  // 获取类型
  getType(symbol) {
    const checkerType: any = this.checker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration
    );
    return this.checker.typeToString(checkerType).toLowerCase();
  }

  // 驼峰变为 -
  formatUpperCamel(str) {
    return this.firstCharLower(str).replace(
      /[A-Z]/g,
      match => `-${match.toLowerCase()}`
    );
  }

  // 首字母小写
  firstCharLower(str) {
    return str.replace(/^[A-Z]/g, match => match.toLowerCase());
  }
}

export const CodeAny = async (options: IOptions) => {
  ts = require('typescript');
  const codeAna = new CodeAnalysis(options);
  return codeAna.start();
};
