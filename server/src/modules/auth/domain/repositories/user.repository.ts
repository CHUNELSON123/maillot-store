import { UserEntity } from '../entities/user.entity';

export interface CreateCustomerData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  registrationSource: string;
}

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract recordSuccessfulLogin(userId: string): Promise<Date>;

  abstract updatePassword(userId: string, passwordHash: string): Promise<void>;

  abstract isRegistrationAllowed(): Promise<boolean>;

  abstract findById(id: string): Promise<UserEntity | null>;

  abstract findCustomerIdByUserId(userId: string): Promise<string | null>;

  abstract createCustomer(data: CreateCustomerData): Promise<UserEntity>;
}
