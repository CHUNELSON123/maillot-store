import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    // Allow guest checkout when no token is provided.
    if (!authorization) {
      return true;
    }

    // Validate a supplied token and populate request.user.
    return (await super.canActivate(context)) as boolean;
  }
}
