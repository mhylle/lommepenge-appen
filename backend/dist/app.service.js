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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
    constructor() { }
    getHello() {
        return 'Velkommen til Lommepenge App\'en!';
    }
    getInfo() {
        return {
            application: 'Lommepenge App\'en - Living Scrapbook',
            version: '1.0.0',
            description: 'Danish pocket money tracker for families',
            message: 'Velkommen til Lommepenge App\'en!',
            features: [
                'Family Management',
                'Pocket Money Tracking',
                'Polaroid-Style Child Cards',
                'Transaction Stickers',
                'Celebratory Animations',
                'Living Scrapbook Design'
            ],
            endpoints: {
                health: '/health',
                api: '/api/app2',
            },
            timestamp: new Date().toISOString()
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppService);
//# sourceMappingURL=app.service.js.map