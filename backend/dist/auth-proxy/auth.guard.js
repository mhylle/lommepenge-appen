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
var AuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_proxy_service_1 = require("./auth-proxy.service");
let AuthGuard = AuthGuard_1 = class AuthGuard {
    authProxyService;
    logger = new common_1.Logger(AuthGuard_1.name);
    constructor(authProxyService) {
        this.authProxyService = authProxyService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const cookies = request.headers.cookie || '';
        if (!cookies) {
            this.logger.warn('No cookies provided in request');
            throw new common_1.UnauthorizedException('No authentication token provided');
        }
        try {
            const validationResult = await this.authProxyService.validateSession(cookies);
            if (!validationResult.valid) {
                this.logger.warn('Invalid session token');
                throw new common_1.UnauthorizedException('Invalid or expired session');
            }
            request.user = validationResult.user;
            return true;
        }
        catch (error) {
            this.logger.error('Authentication error:', error);
            throw new common_1.UnauthorizedException('Authentication failed');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = AuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_proxy_service_1.AuthProxyService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map