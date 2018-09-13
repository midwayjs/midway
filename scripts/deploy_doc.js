'use strict';

const path = require('path');
const ghpages = require('gh-pages');
// The branch that pushing document
const BRANCH = 'gh-pages';
const DOC_PUBLISHER_NAME = 'Auto Doc Publisher';
const DOC_PUBLISHER_EMAIL = 'docs@midwayjs.org';

const execSync = require('child_process').execSync;
const baseDir = process.cwd();

let repo = execSync('git config remote.origin.url', { stdio: 'pipe', cwd: baseDir });
repo = repo.toString().slice(0, -1);
if (/^http/.test(repo)) {
  repo = repo.replace('https://github.com/', 'git@github.com:');
}

let commmitMsg = execSync('git log --format=%B -n 1', { stdio: 'pipe', cwd: baseDir });
commmitMsg = commmitMsg.toString().replace(/\n*$/, '');
commmitMsg = 'docs: auto generate by ci \n' + commmitMsg;

const publishDir = path.join(baseDir, 'docs/.vuepress/dist');
console.log('publish %s from %s to gh-pages', repo, 'docs/.vuepress/dist');

ghpages.publish(publishDir, {
  logger(message) { console.log(message); },
  user: {
    name: DOC_PUBLISHER_NAME,
    email: DOC_PUBLISHER_EMAIL,
  },
  branch: BRANCH,
  repo,
  message: commmitMsg,
}).then(() => {
  console.log('deploy push complete');
});
