import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface LoginDto {
    email: string;
    password: string;
}
export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export interface AuthResponse {
    success: boolean;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    message?: string;
}
export interface ValidationResponse {
    valid: boolean;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}
export declare class AuthProxyService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly authServiceUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<AuthResponse>;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    validateSession(cookies: string): Promise<ValidationResponse>;
    logout(cookies: string): Promise<{
        success: boolean;
    }>;
    getCurrentUser(cookies: string): Promise<ValidationResponse>;
}
