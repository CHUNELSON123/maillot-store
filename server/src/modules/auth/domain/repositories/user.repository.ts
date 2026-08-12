import { UserEntity } from '../entities/user.entity';

export interface CreateCustomerData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract findById(id: string): Promise<UserEntity | null>;

  abstract findCustomerIdByUserId(userId: string): Promise<string | null>;

  abstract createCustomer(data: CreateCustomerData): Promise<UserEntity>;
}
