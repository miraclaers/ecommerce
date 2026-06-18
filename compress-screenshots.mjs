import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, extname, basename } from 'path';

const folder = './docs/screenshots';

const files = await readdir(folder);

for (const file of files) {
  if (extname(file) !== '.png') continue;

  const input = join(folder, file);
  const output = join(folder, basename(file, '.png') + '.webp');

  await sharp(input).webp({ quality: 82 }).toFile(output);
  console.log(`✓ ${file} → ${basename(output)}`);
}
