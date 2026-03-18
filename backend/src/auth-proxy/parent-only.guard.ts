import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

interface JwtUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType?: string;
  childId?: string;
  familyId?: string;
  role?: string;
}

@Injectable()
export class ParentOnlyGuard implements CanActivate {
  private readonly logger = new Logger(ParentOnlyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    const user: JwtUser | undefined = request.user;

    if (!user) {
      this.logger.warn(
        'ParentOnlyGuard: No user found on request - JWT guard must run first',
      );
      throw new ForbiddenException('Adgang nægtet');
    }

    if (user.accountType === 'child') {
      this.logger.warn(
        `ParentOnlyGuard: Child account ${user.id} attempted to access parent-only endpoint`,
      );
      throw new ForbiddenException(
        'Børnekonti har ikke adgang til denne funktion',
      );
    }

    return true;
  }
}
