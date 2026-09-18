// Run after successful checks and packaging. Never overwrite a published release.
const fs = require('node:fs');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { version } = require('../package.json');

if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Expected a stable semver version.');
const commit = process.env.RELEASE_COMMIT;
if (!commit || !/^[a-f0-9]{40}$/.test(commit)) throw new Error('Set RELEASE_COMMIT to the verified commit SHA.');
const tag = `v${version}`;
const asset = `codebase-md-${version}.vsix`;
const checksum = `${asset}.sha256`;
const notes = `releases/RELEASE-NOTES-${version}.md`;
const digest = crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex');
fs.accessSync(notes);
fs.writeFileSync(checksum, `${digest}  ${asset}\n`);
const gh = args => execFileSync('gh', args, { stdio: 'inherit' });
gh(['release', 'create', tag, asset, checksum, '--draft', '--target', commit,
  '--title', `CodebaseMD ${version}`, '--notes-file', notes]);
gh(['release', 'edit', tag, '--draft=false', '--latest']);
