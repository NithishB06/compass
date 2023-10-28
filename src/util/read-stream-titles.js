import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function readTextFile(filename) {
  try {
    const filePath = path.resolve(__dirname, `../../${filename}`);
    const fileData = fs.readFileSync(filePath, 'utf8');
    return fileData;
  } catch {}
}
