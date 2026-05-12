const { spawnSync } = require('child_process');
const path = require('path');
const npm = 'D:\\Software\\nodejs\\npm.cmd';
const cwd = path.resolve(__dirname);
console.log('Running npm install at', cwd);
const result = spawnSync(npm, ['install'], { cwd, stdio: 'inherit' });
if (result.error) {
  console.error('npm install failed:', result.error);
  process.exit(1);
}
process.exit(result.status);
