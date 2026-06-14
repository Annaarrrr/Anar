import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * AuthGuard — validates a Bearer token on every protected route.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  MOCK MODE (current)                                            │
 * │  Accepts any request whose Authorization header matches the     │
 * │  static VALID_MOCK_TOKEN constant below OR the GUARD_SECRET     │
 * │  environment variable if set.                                   │
 * │                                                                 │
 * │  PRODUCTION UPGRADE PATH                                        │
 * │  Replace the `isTokenValid()` body with a call to Dev 1's      │
 * │  Auth service:  GET http://localhost:3001/auth/verify           │
 * │  passing the raw token. Swap in JWT verification once the       │
 * │  shared secret / public key is agreed upon with Dev 1.         │
 * └─────────────────────────────────────────────────────────────────┘
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  // ── Mock token accepted in local development ──────────────────────
  // Change this or set GUARD_SECRET in .env for integration testing.
  private static readonly VALID_MOCK_TOKEN = 'dev3-local-secret-token';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      this.logger.warn(`[AuthGuard] Rejected — no Bearer token on ${request.method} ${request.url}`);
      throw new UnauthorizedException('Missing Authorization header. Expected: Bearer <token>');
    }

    if (!this.isTokenValid(token)) {
      this.logger.warn(`[AuthGuard] Rejected — invalid token on ${request.method} ${request.url}`);
      throw new UnauthorizedException('Invalid or expired token.');
    }

    this.logger.log(`[AuthGuard] Authorised request → ${request.method} ${request.url}`);
    return true;
  }

  // ── Private helpers ───────────────────────────────────────────────

  private extractBearerToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice(7).trim() || null;
  }

  /**
   * ⚠️  MOCK IMPLEMENTATION — replace with real JWT / introspection logic.
   * Accepts either the hardcoded dev token or whatever is set in GUARD_SECRET.
   */
  private isTokenValid(token: string): boolean {
    const envSecret = process.env.GUARD_SECRET;
    const validTokens = new Set<string>([
      AuthGuard.VALID_MOCK_TOKEN,
      ...(envSecret ? [envSecret] : []),
    ]);
    return validTokens.has(token);
  }
}