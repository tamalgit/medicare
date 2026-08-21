import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=================================================");
console.log("  🚀 Starting Medicare Booking Application...   ");
console.log("=================================================");

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Spawn Backend
const backendProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true 
});

console.log("\n  👉 Open http://localhost:5000 in your browser to use Medicare!\n");

// Handle exit cleanly
process.on('SIGINT', () => {
  console.log("\nStopping all services...");
  backendProcess.kill();
  process.exit();
});

backendProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});