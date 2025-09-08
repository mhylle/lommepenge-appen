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
var AppInitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppInitService = void 0;
const common_1 = require("@nestjs/common");
const local_auth_service_1 = require("./auth-proxy/local-auth.service");
let AppInitService = AppInitService_1 = class AppInitService {
    localAuthService;
    logger = new common_1.Logger(AppInitService_1.name);
    constructor(localAuthService) {
        this.localAuthService = localAuthService;
    }
    async onApplicationBootstrap() {
        this.logger.log('Initializing Lommepenge App...');
        try {
            await this.localAuthService.seedTestUser();
            this.logger.log('Application initialization completed');
        }
        catch (error) {
            this.logger.error('Failed to initialize application:', error);
        }
    }
};
exports.AppInitService = AppInitService;
exports.AppInitService = AppInitService = AppInitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [local_auth_service_1.LocalAuthService])
], AppInitService);
//# sourceMappingURL=app-init.service.js.map