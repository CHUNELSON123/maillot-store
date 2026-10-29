import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../domain/repositories/user.repository';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase session lifetime', () => {
  const userRepository = { findByEmail: jest.fn() } as unknown as UserRepository;
  const jwtService = { signAsync: jest.fn().mockResolvedValue('access-token') } as unknown as JwtService;
  let useCase: LoginUseCase;
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('password', 4);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(userRepository, jwtService);
  });

  it('issues a seven-day session for administrators', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue({ id: 'admin-id', email: 'owner@example.com', passwordHash, roleId: 'role-id', roleName: 'Administrator' } as never);
    await useCase.execute({ email: 'owner@example.com', password: 'password' });
    expect(jwtService.signAsync).toHaveBeenCalledWith(expect.objectContaining({ roleName: 'Administrator' }), { expiresIn: '7d' });
  });

  it.each(['Customer', 'Staff', 'Influencer'])('keeps the one-day session for %s accounts', async (roleName) => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue({ id: 'user-id', email: 'user@example.com', passwordHash, roleId: 'role-id', roleName } as never);
    await useCase.execute({ email: 'user@example.com', password: 'password' });
    expect(jwtService.signAsync).toHaveBeenCalledWith(expect.objectContaining({ roleName }), { expiresIn: '1d' });
  });
});
