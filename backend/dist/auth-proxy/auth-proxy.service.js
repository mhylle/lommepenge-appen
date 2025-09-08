"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProxyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let AuthProxyService = AuthProxyService_1 = class AuthProxyService {
    httpService;
    configService;
    logger = new common_1.Logger(AuthProxyService_1.name);
    authServiceUrl;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.authServiceUrl = this.configService.get('AUTH_URL') || 'http://mhylle-auth-service:3000/api/auth';
        this.logger.log(`Auth service URL: ${this.authServiceUrl}`);
    }
    async login(loginDto) {
        try {
            this.logger.log(`Attempting login for user: ${loginDto.email}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/login`, loginDto, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`Login successful for user: ${loginDto.email}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Login failed for user: ${loginDto.email}`, error);
            if (error.response) {
                throw new common_1.HttpException(error.response.data?.message || 'Login failed', error.response.status || common_1.HttpStatus.UNAUTHORIZED);
            }
            throw new common_1.HttpException('Auth service unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async register(registerDto) {
        try {
            this.logger.log(`Attempting registration for user: ${registerDto.email}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/register`, registerDto, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`Registration successful for user: ${registerDto.email}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Registration failed for user: ${registerDto.email}`, error);
            if (error.response) {
                throw new common_1.HttpException(error.response.data?.message || 'Registration failed', error.response.status || common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Auth service unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async validateSession(cookies) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.authServiceUrl}/validate`, {
                timeout: 5000,
                headers: {
                    Cookie: cookies,
                },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Session validation failed', error);
            if (error.response) {
                return { valid: false };
            }
            throw new common_1.HttpException('Auth service unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async logout(cookies) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.authServiceUrl}/logout`, {}, {
                timeout: 5000,
                headers: {
                    Cookie: cookies,
                },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Logout failed', error);
            return { success: true };
        }
    }
    async getCurrentUser(cookies) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.authServiceUrl}/me`, {
                timeout: 5000,
                headers: {
                    Cookie: cookies,
                },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Get current user failed', error);
            return { valid: false };
        }
    }
};
exports.AuthProxyService = AuthProxyService;
exports.AuthProxyService = AuthProxyService = AuthProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], AuthProxyService);
//# sourceMappingURL=auth-proxy.service.js.map