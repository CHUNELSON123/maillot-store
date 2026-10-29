import { ConflictException } from '@nestjs/common';
import { AdminAuthRepository } from '../../domain/repositories/admin-auth.repository';
import { RegisterAdministratorUseCase } from './register-administrator.use-case';

describe('RegisterAdministratorUseCase', () => {
  const repository = { createAdministratorAccount: jest.fn() } as unknown as AdminAuthRepository;
  let useCase: RegisterAdministratorUseCase;
  beforeEach(() => { jest.clearAllMocks(); useCase = new RegisterAdministratorUseCase(repository); });

  it('normalizes email, hashes password and creates account', async () => {
    jest.spyOn(repository, 'createAdministratorAccount').mockResolvedValue({ id: 'admin-id', email: 'owner@example.com' });
    const result = await useCase.execute({ email: ' Owner@Example.com ', password: 'secure-pass-123' });
    expect(repository.createAdministratorAccount).toHaveBeenCalledWith({ email: 'owner@example.com', passwordHash: expect.any(String) });
    expect(result.email).toBe('owner@example.com');
  });

  it('preserves the three-account limit conflict', async () => {
    jest.spyOn(repository, 'createAdministratorAccount').mockRejectedValue(new ConflictException('limit'));
    await expect(useCase.execute({ email: 'owner@example.com', password: 'secure-pass-123' })).rejects.toBeInstanceOf(ConflictException);
  });
});
