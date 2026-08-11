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

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return new UserEntity(user.id, user.email, user.password, user.role_id);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return new UserEntity(user.id, user.email, user.password, user.role_id);
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
          },
        },
      },
    });

    return new UserEntity(user.id, user.email, user.password, user.role_id);
  }
}
