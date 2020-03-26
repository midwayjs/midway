import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as globby from 'globby';
import * as childProcess from 'child_process';

const { mwcc } = require('../src/index');
const { rimraf } = require('./util');

const projectCases = fs.readdirSync(path.join(__dirname, 'cases/project'));

for (const projectName of projectCases) {
  const project = loadProject(projectName);
  describe(`project: ${projectName}`, () => {
    it('should compile', async () => {
      process.chdir(path.dirname(__dirname));
      const projectDir = path.resolve(project.projectRoot);
      const outDir = project.outDir || 'dist';
      rimraf(path.join(projectDir, outDir));
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

    if (project.integration) {
      it('integration', async () => {
        process.chdir(path.dirname(__dirname));
        const projectDir = path.resolve(project.projectRoot);
        await exec(path.join(projectDir, project.integration));
      });
    }
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

async function exec(file) {
  if (!fs.statSync(file).isFile()) {
    throw new Error(`${file} not exists`);
  }
  return new Promise((resolve, reject) => {
    const cp = childProcess.spawn(process.execPath, [file], { stdio: 'inherit' });
    cp.on('error', (err) => {
      reject(err);
    });
    cp.on('exit', (code) => {
      if (code !== 0) {
        return reject(new Error(`Execute ${file} failed for non-zero code`));
      }
      resolve();
    })
  })
}
