import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(projectRoot, 'dist');
const workerOutput = resolve(outputDirectory, 'lumera_student_batch_1', 'index.js');
const serverDirectory = resolve(outputDirectory, 'server');
const metadataDirectory = resolve(outputDirectory, '.openai');

await rm(serverDirectory, { recursive: true, force: true });
await mkdir(serverDirectory, { recursive: true });
await cp(workerOutput, resolve(serverDirectory, 'index.js'));

await rm(metadataDirectory, { recursive: true, force: true });
await mkdir(metadataDirectory, { recursive: true });
await cp(
  resolve(projectRoot, '.openai', 'hosting.json'),
  resolve(metadataDirectory, 'hosting.json'),
);

// Remove stale output from the pre-Cloudflare Vite build. Sites serves dist/client.
await rm(resolve(outputDirectory, 'index.html'), { force: true });
await rm(resolve(outputDirectory, 'assets'), { recursive: true, force: true });
