const { execSync } = require('child_process');
const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

const currentVersion = require('../lerna.json').version;

try {
  const changelogContent = execSync(
    `npx lerna-changelog --nextVersion=v${currentVersion}`
  ).toString();
  console.log(changelogContent);

  if (changelogContent && changelogContent.includes(currentVersion)) {
    const changelogFile = join(__dirname, '../CHANGELOG.md');
    let originContent = readFileSync(changelogFile).toString();
    originContent = originContent.replace(
      /\n\n/,
      '\n\n' + changelogContent + '\n\n'
    );
    writeFileSync(changelogFile, originContent);
  } else {
    console.log('version not generate and skip changelog');
    process.exit(1);
  }
} catch (err) {
  console.log(err);
  process.exit(1);
}
