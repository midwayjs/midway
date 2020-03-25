const assert = require('assert');
const fs = require('fs');
const path = require('path');
const globby = require('globby');

const { mwcc } = require('../src/index');

const projectCases = fs.readdirSync(path.join(__dirname, 'cases/project'));

for (const projectName of projectCases) {
  const project = loadProject(projectName);
  describe(`project: ${projectName}`, () => {
    it('should compile', async () => {
      process.chdir(path.dirname(__dirname));
      const projectDir = path.resolve(project.projectRoot);
      const outDir = project.outDir || 'dist';
      const summary = await mwcc(projectDir, outDir, { compilerOptions: project.compilerOptions, plugins: project.plugins });

      const actualFiles: string[] = globby.sync('**/*', {
        cwd: path.join(projectDir, outDir),
      }).map(it => path.join(outDir, it));
      actualFiles.sort();
      const configJsonIdx = actualFiles.indexOf('dist/midway.build.json');
      assert(configJsonIdx > 0, 'expect midway.build.json');
      actualFiles.splice(configJsonIdx, 1);

      project.outputFiles.sort();
      assert.deepStrictEqual(actualFiles, project.outputFiles);
    });
  });
}

function loadProject(projectName) {
  const filepath = path.join(__dirname, 'cases/project', projectName);
  let it;
  try {
    it = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    throw new Error(`Invalid project definition file(${filepath}).`);
  }
  return it;
}
