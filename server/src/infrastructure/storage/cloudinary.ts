import type {} from 'multer';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'node:crypto';

/** Persist a new file or public image URL. Existing Cloudinary and legacy URLs are retained. */
export async function storeImage(source: Express.Multer.File | string, folder: string): Promise<string> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const key = process.env.CLOUDINARY_API_KEY?.trim();
  const secret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (typeof source === 'string') {
    if (source.startsWith('/uploads/')) return source;
    let url: URL;
    try { url = new URL(source); } catch { throw new BadRequestException('Enter a valid image URL'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || !url.hostname.includes('.') || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) {
      throw new BadRequestException('Enter a public HTTP or HTTPS image URL');
    }
    if (cloud && url.protocol === 'https:' && url.hostname === 'res.cloudinary.com' && url.pathname.startsWith(`/${cloud}/image/upload/`)) return source;
  }
  if (!cloud || !key || !secret) throw new ServiceUnavailableException('Image storage is not configured. Set the Cloudinary credentials on the server.');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const destination = `maillot-store/${folder}`;
  const signature = createHash('sha1').update(`folder=${destination}&timestamp=${timestamp}${secret}`).digest('hex');
  const form = new FormData();
  form.append('api_key', key);
  form.append('timestamp', timestamp);
  form.append('folder', destination);
  form.append('signature', signature);
  if (typeof source === 'string') form.append('file', source);
  else form.append('file', new Blob([new Uint8Array(source.buffer)], { type: source.mimetype }), source.originalname);
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, { method: 'POST', body: form, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('Upload failed');
    const result = await response.json() as { secure_url?: string };
    if (!result.secure_url || !result.secure_url.startsWith(`https://res.cloudinary.com/${cloud}/`)) throw new Error('Invalid upload response');
    return result.secure_url;
  } catch {
    throw new ServiceUnavailableException('Could not save the image. Check the image URL and Cloudinary configuration.');
  }
}
