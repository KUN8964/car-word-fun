import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(projectRoot, 'public', 'vehicle-library');
const outputDir = path.join(projectRoot, 'public', 'vehicle-thumbs');

await mkdir(outputDir, { recursive: true });
const sourceFiles = (await readdir(sourceDir))
  .filter((filename) => /\.(png|jpe?g)$/i.test(filename))
  .sort();

let sourceBytes = 0;
let outputBytes = 0;

for (const filename of sourceFiles) {
  const sourcePath = path.join(sourceDir, filename);
  const outputPath = path.join(outputDir, `${path.parse(filename).name}.webp`);
  const sourceInfo = await stat(sourcePath);
  sourceBytes += sourceInfo.size;

  await sharp(sourcePath)
    .resize({ width: 320, height: 240, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78, alphaQuality: 90, effort: 5 })
    .toFile(outputPath);

  const outputInfo = await stat(outputPath);
  outputBytes += outputInfo.size;
}

const reduction = sourceBytes > 0 ? Math.round((1 - outputBytes / sourceBytes) * 100) : 0;
console.log(`Generated ${sourceFiles.length} WebP thumbnails in public/vehicle-thumbs`);
console.log(`${formatBytes(sourceBytes)} -> ${formatBytes(outputBytes)} (${reduction}% smaller)`);

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
