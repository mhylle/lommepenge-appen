import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthProxyService } from './auth-proxy.service';
export declare class AuthGuard implements CanActivate {
    private readonly authProxyService;
    private readonly logger;
    constructor(authProxyService: AuthProxyService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
