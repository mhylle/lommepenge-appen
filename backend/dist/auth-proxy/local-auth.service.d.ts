import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
export interface LoginDto {
    email: string;
    password: string;
}
export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    familyName?: string;
}
export interface AuthResponse {
    success: boolean;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        permissions: {
            apps: string[];
            roles: Record<string, string[]>;
        };
    };
    access_token?: string;
    message?: string;
}
export interface ValidationResponse {
    valid: boolean;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        permissions: {
            apps: string[];
            roles: Record<string, string[]>;
        };
    };
}
export declare class LocalAuthService {
    private userRepository;
    private jwtService;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    private buildUserResponse;
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    validateByJwt(payload: any): Promise<ValidationResponse>;
    getCurrentUser(userId: string): Promise<ValidationResponse>;
    logout(): Promise<{
        success: boolean;
    }>;
    seedTestUser(): Promise<void>;
}
