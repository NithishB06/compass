import { readdir } from 'fs/promises';
import fs from 'fs';

export async function countFilesInDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const files = await readdir(dirPath);
    return files.length;
  } catch {}
}
