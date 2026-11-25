import { AdminAuthController } from './admin-auth.controller';

describe('administrator registration', () => {
  it('registers with the email and password submitted on the page', async () => {
    const register = { execute: jest.fn().mockResolvedValue({ id: 'admin' }) };
    const controller = new AdminAuthController(register as never, {} as never);
    await controller.registerAdministrator({ email: 'owner@example.com', password: 'password123' });
    expect(register.execute).toHaveBeenCalledWith({ email: 'owner@example.com', password: 'password123' });
  });
});
