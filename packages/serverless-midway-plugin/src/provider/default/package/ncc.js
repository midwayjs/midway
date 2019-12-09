const path = require('path');
const fs = require('fs-extra');
const { shell } = require('execa');
const readdir = require('recursive-readdir');
const ts = require('typescript');
const ejs = require('ejs');

const cwd = process.cwd();

const source = path.resolve(cwd, 'src');
const dist = path.resolve(cwd, 'dist');
const nccEntry = path.resolve(cwd, '.ncc_entry');
const entry = path.resolve(nccEntry, 'index.ts');

exports.buildByNcc = async function build() {
  /**
   * 1. 移除上一次创建的临时目录
   */
  await shell(`rm -rf ${dist} ${nccEntry}`);
  /**
   * 2. 创建入口目录
   */
  await fs.ensureDir(nccEntry);
  /**
   * 3. 生成编译入口文件
   */
  await generateEntry();
  /**
   * 4. 开始编译
   */
  await compile();
};

async function generateEntry() {
  const files = await getProviderFiles();

  const tpl = path.resolve(__dirname, 'tpl/ncc.ejs');
  const content = await ejs.renderFile(tpl, { files });

  await fs.writeFile(entry, content, { encoding: 'utf-8' });
}

/**
 * 使用 ncc 编译成单文件
 */
async function compile() {
  const ncc = require.resolve('@zeit/ncc/dist/ncc/cli.js');
  const output = path.resolve(dist);

  await shell(`${ncc} build ${entry} -o ${output} -s`, {
    stdio: 'inherit',
    cwd
  });
}

async function getProviderFiles(params) {
  const files = await readdir(source);

  const validTSFiles = files
    .filter(file => path.extname(file) === '.ts')
    .filter(useProvide);

  return validTSFiles;
}

function useProvide(file) {
  const sourceFile = ts.createSourceFile(
    '',
    fs.readFileSync(file, { encoding: 'utf-8' }),
    ts.ScriptTarget.Latest,
    true
  );

  const syntaxNodes = sourceFile
    .getChildren()
    .filter(node => node.kind === ts.SyntaxKind.SyntaxList);

  if (!Array.isArray(syntaxNodes) || syntaxNodes.length === 0) {
    throw new Error(`${file} 内容格式不正确，TS 编译失败`);
  }

  const syntaxList = syntaxNodes[0].getChildren();

  const isProvide = syntaxList
    .filter(node => node.kind === ts.SyntaxKind.ClassDeclaration)
    .filter(node => Array.isArray(node.decorators))
    .some(node => {
      const useProvide = node.decorators.some(decorator =>
        decorator.getText().includes('provide')
      );
      return useProvide;
    });

  return isProvide;
}
