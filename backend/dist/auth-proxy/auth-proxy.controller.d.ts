import { Request, Response } from 'express';
import { LocalAuthService, LoginDto, RegisterDto } from './local-auth.service';
import { FamiliesService } from '../families/families.service';
export declare class AuthProxyController {
    private readonly localAuthService;
    private readonly familiesService;
    private readonly logger;
    constructor(localAuthService: LocalAuthService, familiesService: FamiliesService);
    login(loginDto: LoginDto, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    register(registerDto: RegisterDto, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    validateSession(req: Request & {
        user: any;
    }): Promise<import("./local-auth.service").ValidationResponse>;
    logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCurrentUser(req: Request & {
        user: any;
    }): Promise<import("./local-auth.service").ValidationResponse>;
}
