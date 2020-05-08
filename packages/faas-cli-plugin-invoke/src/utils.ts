import { existsSync, remove } from 'fs-extra';
import { join } from 'path';
export const exportMidwayFaaS = (() => {
  const midwayModuleName = process.env.MidwayModuleName || '@midwayjs/faas';
  const faasPath = join(process.cwd(), './node_modules/', midwayModuleName);
  if (existsSync(faasPath)) {
    return require(faasPath);
  } else {
    try {
      return require(midwayModuleName);
    } catch (e) {
      return { FaaSStarter: class DefaulltMidwayFaasStarter {} };
    }
  }
})();

export const FaaSStarterClass = exportMidwayFaaS.FaaSStarter;

export const cleanTarget = async (p: string) => {
  if (existsSync(p)) {
    await remove(p);
  }
};
