import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');
const sourceOnlyDirectories = ['cards', 'vehicle-library', 'videos'];

await Promise.all(sourceOnlyDirectories.map((directory) => (
  rm(path.join(distDir, directory), { recursive: true, force: true })
)));

console.log(`Removed source-only assets from dist: ${sourceOnlyDirectories.join(', ')}`);
