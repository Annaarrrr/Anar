import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException();

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
