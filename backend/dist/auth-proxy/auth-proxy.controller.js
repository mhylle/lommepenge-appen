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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthProxyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProxyController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const local_auth_service_1 = require("./local-auth.service");
const production_auth_service_1 = require("./production-auth.service");
const families_service_1 = require("../families/families.service");
let AuthProxyController = AuthProxyController_1 = class AuthProxyController {
    localAuthService;
    productionAuthService;
    familiesService;
    logger = new common_1.Logger(AuthProxyController_1.name);
    authService;
    constructor(localAuthService, productionAuthService, familiesService) {
        this.localAuthService = localAuthService;
        this.productionAuthService = productionAuthService;
        this.familiesService = familiesService;
        const useProductionAuth = process.env.USE_PRODUCTION_AUTH === 'true';
        this.authService = useProductionAuth ? this.productionAuthService : this.localAuthService;
        this.logger.log(`Using ${useProductionAuth ? 'production' : 'local'} authentication service`);
    }
    async login(loginDto, req, res) {
        try {
            const result = await this.authService.login(loginDto);
            if (result.success && result.user) {
                try {
                    const parentName = `${result.user.firstName} ${result.user.lastName}`.trim();
                    const family = await this.familiesService.createOrGetDefaultFamily(result.user.id, parentName || result.user.firstName);
                    this.logger.log(`Family ensured for user ${result.user.id}: ${family.id}`);
                    const enrichedResult = {
                        ...result,
                        family: {
                            id: family.id,
                            name: family.name,
                            currency: family.currency,
                            isFirstTime: family.description?.includes('automatisk'),
                        },
                    };
                    return res.status(common_1.HttpStatus.OK).json(enrichedResult);
                }
                catch (familyError) {
                    this.logger.warn(`Failed to create family for user ${result.user.id}:`, familyError);
                    const resultWithWarning = {
                        ...result,
                        warnings: ['Familie kunne ikke oprettes automatisk. Prøv igen senere.'],
                    };
                    return res.status(common_1.HttpStatus.OK).json(resultWithWarning);
                }
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            this.logger.error('Login error:', error);
            return res.status(error.getStatus?.() || common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    }
    async register(registerDto, req, res) {
        try {
            const result = await this.authService.register(registerDto);
            if (result.success && result.user) {
                try {
                    const parentName = `${result.user.firstName} ${result.user.lastName}`.trim();
                    const familyName = registerDto.familyName || `${parentName} Familie`;
                    const family = await this.familiesService.createOrGetDefaultFamily(result.user.id, parentName || result.user.firstName, familyName);
                    this.logger.log(`Family created for new user ${result.user.id}: ${family.id}`);
                    const enrichedResult = {
                        ...result,
                        family: {
                            id: family.id,
                            name: family.name,
                            currency: family.currency,
                            isFirstTime: true,
                        },
                    };
                    return res.status(common_1.HttpStatus.CREATED).json(enrichedResult);
                }
                catch (familyError) {
                    this.logger.warn(`Failed to create family for new user ${result.user.id}:`, familyError);
                    const resultWithWarning = {
                        ...result,
                        warnings: ['Familie kunne ikke oprettes automatisk. Du kan oprette en senere.'],
                    };
                    return res.status(common_1.HttpStatus.CREATED).json(resultWithWarning);
                }
            }
            return res.status(common_1.HttpStatus.CREATED).json(result);
        }
        catch (error) {
            this.logger.error('Registration error:', error);
            return res.status(error.getStatus?.() || common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    }
    async validateSession(req) {
        try {
            const result = await this.authService.validateByJwt(req.user);
            if (result.valid && result.user) {
                try {
                    const parentName = `${result.user.firstName} ${result.user.lastName}`.trim();
                    const family = await this.familiesService.createOrGetDefaultFamily(result.user.id, parentName || result.user.firstName);
                    const enrichedResult = {
                        ...result,
                        family: {
                            id: family.id,
                            name: family.name,
                            currency: family.currency,
                            isFirstTime: family.description?.includes('automatisk'),
                        },
                    };
                    return enrichedResult;
                }
                catch (familyError) {
                    this.logger.warn(`Failed to create family for user ${result.user.id}:`, familyError);
                    return result;
                }
            }
            return result;
        }
        catch (error) {
            this.logger.error('Validation error:', error);
            return { valid: false };
        }
    }
    async logout(req, res) {
        try {
            const result = await this.authService.logout();
            res.clearCookie('authToken', {
                domain: 'mhylle.com',
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'lax'
            });
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            this.logger.error('Logout error:', error);
            return res.status(common_1.HttpStatus.OK).json({ success: true });
        }
    }
    async getCurrentUser(req) {
        try {
            const result = await this.authService.getCurrentUser(req.user?.id);
            return result;
        }
        catch (error) {
            this.logger.error('Get current user error:', error);
            return { valid: false };
        }
    }
};
exports.AuthProxyController = AuthProxyController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthProxyController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthProxyController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('validate'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthProxyController.prototype, "validateSession", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthProxyController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthProxyController.prototype, "getCurrentUser", null);
exports.AuthProxyController = AuthProxyController = AuthProxyController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [local_auth_service_1.LocalAuthService,
        production_auth_service_1.ProductionAuthService,
        families_service_1.FamiliesService])
], AuthProxyController);
//# sourceMappingURL=auth-proxy.controller.js.map