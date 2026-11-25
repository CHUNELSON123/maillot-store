import { storeImage } from './cloudinary';

describe('Cloudinary image storage', () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };
  beforeEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';
  });
  afterEach(() => { global.fetch = originalFetch; process.env = { ...originalEnv }; });

  it('uploads a remote image using a signed request and returns its permanent URL', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v1/image.jpg' }) });
    global.fetch = fetchMock as unknown as typeof fetch;
    expect(await storeImage('https://example.com/image.jpg', 'categories')).toBe('https://res.cloudinary.com/test-cloud/image/upload/v1/image.jpg');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.cloudinary.com/v1_1/test-cloud/image/upload');
    expect(options.body.get('file')).toBe('https://example.com/image.jpg');
    expect(options.body.get('signature')).toMatch(/^[a-f0-9]{40}$/);
  });

  it('uploads a file and retains an existing Cloudinary URL without re-uploading', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v1/image.png' }) });
    global.fetch = fetchMock as unknown as typeof fetch;
    const file = { buffer: Buffer.from('image'), mimetype: 'image/png', originalname: 'image.png' } as Express.Multer.File;
    const url = await storeImage(file, 'products');
    expect(await storeImage(url, 'products')).toBe(url);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].body.get('file')).toBeInstanceOf(Blob);
  });

  it('rejects unsafe URLs and missing configuration instead of using temporary storage', async () => {
    await expect(storeImage('http://127.0.0.1/image.png', 'cms')).rejects.toThrow();
    delete process.env.CLOUDINARY_API_SECRET;
    await expect(storeImage('https://example.com/image.png', 'cms')).rejects.toThrow('Image storage is not configured');
  });
});
