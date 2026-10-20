import { resolve } from 'node:path';

export function getUploadsDirectory(): string {
  const configuredPath = process.env.UPLOADS_DIR?.trim() || './uploads';
  return resolve(configuredPath);
}
