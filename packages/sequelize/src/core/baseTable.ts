import { setModelName, addOptions, Model, TableOptions } from "sequelize-typescript"
import { saveModule } from "@midwayjs/decorator"

export function BaseTable<M extends Model = Model>(options: TableOptions<M>): Function;
export function BaseTable(target: (Function)): void;
export function BaseTable(arg?:any){
  if (typeof arg === 'function') {
      saveModule(`sequelize:core`, arg)
      annotate(arg);
  }
  else {
      const options = Object.assign({}, arg);
      return (target) => {
        saveModule(`sequelize:core`, target)
        annotate(target, options);
      }
  }
}

function annotate(target, options:any = {}) {
  setModelName(target.prototype, options.modelName || target.name);
  addOptions(target.prototype, options);
}
