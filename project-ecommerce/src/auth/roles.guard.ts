import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<('admin' | 'cliente')[]>('roles', ctx.getHandler());
    if (!roles || roles.length === 0) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    return roles.includes(user?.role);
  }
}