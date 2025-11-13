import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const saveUpload = async (filename: string, data: Buffer): Promise<string> => {
  const filepath = path.join(UPLOADS_DIR, filename);
  await fs.promises.writeFile(filepath, data);
  return filepath;
};

export const readUpload = async (filename: string): Promise<string> => {
  const filepath = path.join(UPLOADS_DIR, filename);
  return fs.promises.readFile(filepath, 'utf-8');
};
