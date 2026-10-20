import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
  roleId: string;
  roleName?: string;
}

interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    const userRole = user.roleName ?? '';
    if (requiredRoles.includes(userRole)) return true;

    // Influencers created from existing customer accounts keep their customer
    // record and can continue using storefront account, cart, and wishlist APIs.
    return userRole === 'Influencer' && requiredRoles.includes('Customer');
  }
}
