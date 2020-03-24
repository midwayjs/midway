const assert = require('assert');
const fs = require('fs');
const path = require('path');
const globby = require('globby');

const { mwcc } = require('../src/index');

const projectCases = fs.readdirSync(path.join(__dirname, 'cases/project'));

for (const projectName of projectCases) {
  const project = loadProject(projectName);
  describe(`project: ${projectName}`, () => {
    it('should compile', () => {
      const projectDir = path.resolve(project.projectRoot);
      const outDir = project.outDir || 'dist';
      const summary = mwcc(projectDir, outDir, { compilerOptions: project.compilerOptions });

      const actualFiles = globby.sync('**/*', {
        cwd: path.join(projectDir, outDir),
      }).map(it => path.join(outDir, it));
      actualFiles.sort();
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
