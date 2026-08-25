const https = require('https');
const { readFileSync } = require('fs');
const { join } = require('path');

const currentVersion = require('../lerna.json').version;
const token = process.env.GITHUB_AUTH || process.env.GITHUB_TOKEN;

if (!token) {
  console.error('Must provide GITHUB_AUTH or GITHUB_TOKEN');
  process.exit(1);
}

function getVersionChangelog() {
  const changelog = readFileSync(join(__dirname, '../CHANGELOG.md'), 'utf8');
  const heading = `## v${currentVersion} `;
  const start = changelog.indexOf(heading);

  if (start === -1) {
    throw new Error(`Could not find changelog for v${currentVersion}`);
  }

  const nextHeading = changelog.indexOf('\n## ', start + heading.length);
  return changelog
    .slice(start, nextHeading === -1 ? undefined : nextHeading)
    .trim();
}

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const request = https.request(
      {
        hostname: 'api.github.com',
        path,
        method,
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'midway-release-workflow',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(payload
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      response => {
        let responseBody = '';
        response.setEncoding('utf8');
        response.on('data', chunk => (responseBody += chunk));
        response.on('end', () => {
          let parsedBody;
          try {
            parsedBody = responseBody ? JSON.parse(responseBody) : undefined;
          } catch {
            parsedBody = responseBody;
          }

          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              new Error(
                `GitHub API ${method} ${path} failed (${response.statusCode}): ${JSON.stringify(parsedBody)}`
              )
            );
            return;
          }
          resolve(parsedBody);
        });
      }
    );
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

async function main() {
  const tag = `v${currentVersion}`;
  const body = getVersionChangelog();
  const releaseData = {
    tag_name: tag,
    target_commitish: process.env.GITHUB_REF_NAME || 'v4-next',
    name: currentVersion,
    body,
    draft: false,
    prerelease: false,
    generate_release_notes: false,
  };

  let release;
  try {
    release = await request(
      'GET',
      `/repos/midwayjs/midway/releases/tags/${tag}`
    );
    release = await request(
      'PATCH',
      `/repos/midwayjs/midway/releases/${release.id}`,
      releaseData
    );
    console.log(`Updated GitHub release ${release.html_url || tag}`);
    return;
  } catch (error) {
    if (!error.message.includes('(404)')) {
      throw error;
    }
  }

  release = await request(
    'POST',
    '/repos/midwayjs/midway/releases',
    releaseData
  );

  console.log(`Created GitHub release ${release.html_url || tag}`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
