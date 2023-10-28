import { promises as fsPromises } from 'fs';

export async function readPhrases(filename) {
  const fileContents = await fsPromises.readFile(filename, 'utf-8');

  const fileContentArray = fileContents.split(/\r?\n/);

  return fileContentArray;
}
