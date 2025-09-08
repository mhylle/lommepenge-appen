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
var LocalAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalAuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../entities/user.entity");
const bcrypt = require("bcryptjs");
let LocalAuthService = LocalAuthService_1 = class LocalAuthService {
    userRepository;
    jwtService;
    logger = new common_1.Logger(LocalAuthService_1.name);
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        try {
            const user = await this.userRepository.findOne({ where: { email } });
            if (user && await bcrypt.compare(password, user.password)) {
                const { password: _, ...result } = user;
                return result;
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Error validating user ${email}:`, error);
            return null;
        }
    }
    async login(loginDto) {
        try {
            this.logger.log(`Attempting login for user: ${loginDto.email}`);
            const user = await this.validateUser(loginDto.email, loginDto.password);
            if (!user) {
                throw new common_1.HttpException('Invalid credentials', common_1.HttpStatus.UNAUTHORIZED);
            }
            const payload = {
                email: user.email,
                sub: user.id,
                firstName: user.firstName,
                lastName: user.lastName
            };
            const access_token = this.jwtService.sign(payload);
            this.logger.log(`Login successful for user: ${loginDto.email}`);
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                access_token,
            };
        }
        catch (error) {
            this.logger.error(`Login failed for user: ${loginDto.email}`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Authentication service error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async register(registerDto) {
        try {
            this.logger.log(`Attempting registration for user: ${registerDto.email}`);
            const existingUser = await this.userRepository.findOne({
                where: { email: registerDto.email }
            });
            if (existingUser) {
                throw new common_1.HttpException('User already exists', common_1.HttpStatus.CONFLICT);
            }
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            const user = this.userRepository.create({
                email: registerDto.email,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                password: hashedPassword,
            });
            const savedUser = await this.userRepository.save(user);
            const payload = {
                email: savedUser.email,
                sub: savedUser.id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName
            };
            const access_token = this.jwtService.sign(payload);
            this.logger.log(`Registration successful for user: ${registerDto.email}`);
            return {
                success: true,
                user: {
                    id: savedUser.id,
                    email: savedUser.email,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                },
                access_token,
            };
        }
        catch (error) {
            this.logger.error(`Registration failed for user: ${registerDto.email}`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Registration failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async validateByJwt(payload) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: payload.sub }
            });
            if (!user || !user.isActive) {
                return { valid: false };
            }
            return {
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            };
        }
        catch (error) {
            this.logger.error('JWT validation failed:', error);
            return { valid: false };
        }
    }
    async getCurrentUser(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });
            if (!user || !user.isActive) {
                return { valid: false };
            }
            return {
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            };
        }
        catch (error) {
            this.logger.error('Get current user failed:', error);
            return { valid: false };
        }
    }
    async logout() {
        return { success: true };
    }
    async seedTestUser() {
        try {
            const testUser = await this.userRepository.findOne({
                where: { email: 'test@familie.dk' }
            });
            if (!testUser) {
                const hashedPassword = await bcrypt.hash('password123', 10);
                const user = this.userRepository.create({
                    email: 'test@familie.dk',
                    firstName: 'Test',
                    lastName: 'Familie',
                    password: hashedPassword,
                });
                await this.userRepository.save(user);
                this.logger.log('Test user created: test@familie.dk / password123');
            }
            else {
                this.logger.log('Test user already exists: test@familie.dk / password123');
            }
        }
        catch (error) {
            this.logger.error('Failed to create test user:', error);
        }
    }
};
exports.LocalAuthService = LocalAuthService;
exports.LocalAuthService = LocalAuthService = LocalAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], LocalAuthService);
//# sourceMappingURL=local-auth.service.js.map