const { execSync } = require('child_process');
const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

const currentVersion = require('../lerna.json').version;

if (/beta/.test(currentVersion) || /alpha/.test(currentVersion)) {
  return;
}

if (!process.env.GITHUB_AUTH) {
  console.error('Must provide GITHUB_AUTH');
  process.exit(1);
}

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

    console.log('start create release for version: ', currentVersion);

    const url = `
    curl \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${process.env.GITHUB_AUTH}" \
    https://api.github.com/repos/midwayjs/midway/releases \
    -d '{"tag_name":"v${currentVersion}","target_commitish":"main","name":"${currentVersion}","body":"${changelogContent}","draft":false,"prerelease":false,"generate_release_notes":false}'
    `;

    execSync(url).toString();
  } else {
    console.log('version not generate and skip changelog');
    process.exit(1);
  }
} catch (err) {
  console.log(err);
  process.exit(1);
}
