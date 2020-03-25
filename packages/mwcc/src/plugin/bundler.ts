import * as path from 'path';
import * as ncc from '@midwayjs/ncc';
import { MwccPluginContext, MwccCompilerHost } from '../iface';

export default async function bundle(ctx: MwccPluginContext, host: MwccCompilerHost) {
  const bundleOpts = ctx.options.plugins.bundler;
  const outFiles = [];

  for (let [entry, target] of Object.entries(bundleOpts.entries)) {
    if (ctx.files.indexOf(entry) < 0) {
      throw new Error(`entry(${entry}) not included in compilation.`);
    }
    const resolvedEntry = ctx.getTsOutputPath(entry);
    const targetFilepath = path.join(ctx.buildDir, target);
    const {err, code, map, assets, symlinks, stats} = await ncc(resolvedEntry, {
      cache: false,
      filename: target,
      sourceMap: true,
      sourceMapRegister: false,
    });

    host.writeFile(targetFilepath, code, false);
    host.writeFile(`${targetFilepath}.map`, map, false);
    outFiles.push(targetFilepath);
    outFiles.push(`${targetFilepath}.map`);
  }

  ctx.outFiles = outFiles;
}
