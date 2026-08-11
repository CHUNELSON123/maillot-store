import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface RegisterCustomerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

@Injectable()
export class RegisterCustomerUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterCustomerInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await this.userRepository.createCustomer({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    return {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    };
  }
}
