import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await generateWebpSet({
  sourceDir: path.join(projectRoot, 'public', 'vehicle-library'),
  outputDir: path.join(projectRoot, 'public', 'vehicle-thumbs'),
  width: 320,
  height: 240,
  quality: 70,
  maxBytes: 32 * 1024,
});

await generateWebpSet({
  sourceDir: path.join(projectRoot, 'public', 'cards'),
  outputDir: path.join(projectRoot, 'public', 'card-thumbs'),
  width: 512,
  quality: 74,
  maxBytes: 80 * 1024,
});

async function generateWebpSet({ sourceDir, outputDir, width, height, quality, maxBytes }) {
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
      .resize({ width, height, fit: 'inside', withoutEnlargement: true })
      .webp({
        quality,
        alphaQuality: 85,
        effort: 6,
        smartSubsample: true,
      })
      .toFile(outputPath);

    const outputInfo = await stat(outputPath);
    if (outputInfo.size > maxBytes) {
      throw new Error(`${filename} exceeds image budget: ${formatBytes(outputInfo.size)} > ${formatBytes(maxBytes)}`);
    }
    outputBytes += outputInfo.size;
  }

  const reduction = sourceBytes > 0 ? Math.round((1 - outputBytes / sourceBytes) * 100) : 0;
  console.log(`Generated ${sourceFiles.length} WebP thumbnails in ${path.relative(projectRoot, outputDir)}`);
  console.log(`${formatBytes(sourceBytes)} -> ${formatBytes(outputBytes)} (${reduction}% smaller)`);
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
