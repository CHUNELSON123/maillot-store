import { UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { LoginUseCase } from '../../../auth/application/use-cases/login.use-case';
import { LoginAdministratorUseCase } from './login-administrator.use-case';

describe('LoginAdministratorUseCase', () => {
  const users = {
    findByEmail: jest.fn(),
  } as unknown as UserRepository;

  const login = {
    execute: jest.fn(),
  } as unknown as LoginUseCase;

  let useCase: LoginAdministratorUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginAdministratorUseCase(users, login);
  });

  it('only delegates credentials for Administrator accounts', async () => {
    jest.spyOn(users, 'findByEmail').mockResolvedValue({
      id: 'admin-id',
      email: 'admin@example.com',
      passwordHash: 'hash',
      roleId: 'admin-role',
      roleName: 'Administrator',
    });

    jest.spyOn(login, 'execute').mockResolvedValue({
      accessToken: 'jwt',
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        roleId: 'role-admin',
        roleName: 'Administrator',
      },
    });

    await expect(
      useCase.execute({
        email: 'ADMIN@example.com',
        password: 'password',
      }),
    ).resolves.toEqual({
      accessToken: 'jwt',
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        roleId: 'role-admin',
        roleName: 'Administrator',
      },
    });

    expect(login.execute).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'password',
    });
  });

  it('rejects non-administrator accounts', async () => {
    jest.spyOn(users, 'findByEmail').mockResolvedValue({
      id: 'customer-id',
      email: 'customer@example.com',
      passwordHash: 'hash',
      roleId: 'customer-role',
      roleName: 'Customer',
    });

    await expect(
      useCase.execute({
        email: 'customer@example.com',
        password: 'password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(login.execute).not.toHaveBeenCalled();
  });
});
