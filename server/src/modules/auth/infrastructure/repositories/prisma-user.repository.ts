import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  CreateCustomerData,
  UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async recordSuccessfulLogin(userId: string): Promise<Date> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { last_login_at: new Date() },
      select: { last_login_at: true },
    });
    return user.last_login_at!;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { password: passwordHash } });
  }

  async isRegistrationAllowed(): Promise<boolean> {
    const setting = await this.prisma.systemSetting.findFirst({
      where: { key: 'allow_registration', deleted_at: null },
      select: { value: true },
    });
    return setting?.value !== 'false';
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return new UserEntity(
      user.id,
      user.email,
      user.password,
      user.role_id,
      user.role.name,
    );
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return new UserEntity(
      user.id,
      user.email,
      user.password,
      user.role_id,
      user.role.name,
    );
  }

  async findCustomerIdByUserId(userId: string): Promise<string | null> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
      },
    });

    return customer?.id ?? null;
  }

  async createCustomer(data: CreateCustomerData): Promise<UserEntity> {
    const customerRole = await this.prisma.role.findUnique({
      where: { name: 'Customer' },
    });

    if (!customerRole) {
      throw new Error('Customer role not found');
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.passwordHash,
        role_id: customerRole.id,
        customer: {
          create: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            registration_source: data.registrationSource,
          },
        },
      },
    });

    return new UserEntity(
      user.id,
      user.email,
      user.password,
      user.role_id,
      customerRole.name,
    );
  }
}
