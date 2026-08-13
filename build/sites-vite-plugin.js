import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

/** Packages this existing Vite SPA as a Cloudflare Worker-compatible Sites build. */
export function sites() {
  let root = process.cwd();

  return {
    name: 'lumera-sites',
    apply: 'build',
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const outputDirectory = resolve(root, 'dist');
      const metadataDirectory = resolve(outputDirectory, '.openai');

      await rm(metadataDirectory, { recursive: true, force: true });
      await mkdir(metadataDirectory, { recursive: true });
      await cp(resolve(root, '.openai', 'hosting.json'), resolve(metadataDirectory, 'hosting.json'));
    },
  };
}
