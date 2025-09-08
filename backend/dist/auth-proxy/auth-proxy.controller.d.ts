import { Request, Response } from 'express';
import { LocalAuthService, LoginDto, RegisterDto } from './local-auth.service';
import { FamiliesService } from '../families/families.service';
export declare class AuthProxyController {
    private readonly localAuthService;
    private readonly familiesService;
    private readonly logger;
    constructor(localAuthService: LocalAuthService, familiesService: FamiliesService);
    login(loginDto: LoginDto, req: Request, res: Response): unknown;
    register(registerDto: RegisterDto, req: Request, res: Response): unknown;
    validateSession(req: Request & {
        user: any;
    }): unknown;
    logout(req: Request, res: Response): unknown;
    getCurrentUser(req: Request & {
        user: any;
    }): unknown;
}
