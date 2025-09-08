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
exports.UpdatePocketMoneyUserDto = exports.CreateChildDto = exports.CreatePocketMoneyUserDto = void 0;
const class_validator_1 = require("class-validator");
class CreatePocketMoneyUserDto {
    name;
    familyId;
    dateOfBirth;
    profilePicture;
    cardColor;
    weeklyAllowance;
    authUserId;
    preferences;
    role;
}
exports.CreatePocketMoneyUserDto = CreatePocketMoneyUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePocketMoneyUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePocketMoneyUserDto.prototype, "familyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePocketMoneyUserDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePocketMoneyUserDto.prototype, "profilePicture", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePocketMoneyUserDto.prototype, "cardColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePocketMoneyUserDto.prototype, "weeklyAllowance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePocketMoneyUserDto.prototype, "authUserId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePocketMoneyUserDto.prototype, "preferences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['child', 'teen']),
    __metadata("design:type", String)
], CreatePocketMoneyUserDto.prototype, "role", void 0);
class CreateChildDto {
    name;
    familyId;
    age;
    cardColor;
    initialBalance;
    profilePicture;
    weeklyAllowance;
}
exports.CreateChildDto = CreateChildDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Navn skal være tekst' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Navn må maksimalt være 50 karakterer' }),
    __metadata("design:type", String)
], CreateChildDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Familie ID er påkrævet' }),
    __metadata("design:type", String)
], CreateChildDto.prototype, "familyId", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Alder skal være et helt tal' }),
    (0, class_validator_1.Min)(3, { message: 'Barn skal være mindst 3 år gammelt' }),
    (0, class_validator_1.Max)(17, { message: 'Barn må maksimalt være 17 år gammelt' }),
    __metadata("design:type", Number)
], CreateChildDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)({ message: 'Farve skal være en gyldig hex-kode (f.eks. #FF5733)' }),
    __metadata("design:type", String)
], CreateChildDto.prototype, "cardColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Start balance skal være et tal' }),
    (0, class_validator_1.Min)(0, { message: 'Start balance kan ikke være negativ' }),
    (0, class_validator_1.Max)(10000, { message: 'Start balance må maksimalt være 10.000 kr.' }),
    __metadata("design:type", Number)
], CreateChildDto.prototype, "initialBalance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "profilePicture", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Ugepenge skal være et tal' }),
    (0, class_validator_1.Min)(0, { message: 'Ugepenge kan ikke være negative' }),
    (0, class_validator_1.Max)(500, { message: 'Ugepenge må maksimalt være 500 kr.' }),
    __metadata("design:type", Number)
], CreateChildDto.prototype, "weeklyAllowance", void 0);
class UpdatePocketMoneyUserDto {
    name;
    dateOfBirth;
    profilePicture;
    cardColor;
    weeklyAllowance;
    isActive;
    authUserId;
    preferences;
    role;
}
exports.UpdatePocketMoneyUserDto = UpdatePocketMoneyUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdatePocketMoneyUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePocketMoneyUserDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePocketMoneyUserDto.prototype, "profilePicture", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePocketMoneyUserDto.prototype, "cardColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePocketMoneyUserDto.prototype, "weeklyAllowance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePocketMoneyUserDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePocketMoneyUserDto.prototype, "authUserId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdatePocketMoneyUserDto.prototype, "preferences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['child', 'teen']),
    __metadata("design:type", String)
], UpdatePocketMoneyUserDto.prototype, "role", void 0);
//# sourceMappingURL=pocket-money-user.dto.js.map