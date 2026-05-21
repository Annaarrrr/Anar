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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateController = void 0;
const common_1 = require("@nestjs/common");
const generate_request_dto_1 = require("../dto/generate-request.dto");
const generate_service_1 = require("./generate.service");
let GenerateController = class GenerateController {
    constructor(generateService) {
        this.generateService = generateService;
    }
    generateTasks(dto) {
        return this.generateService.generateTasks(dto);
    }
};
exports.GenerateController = GenerateController;
__decorate([
    (0, common_1.Post)('generate-tasks'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_request_dto_1.GenerateRequestDto]),
    __metadata("design:returntype", Promise)
], GenerateController.prototype, "generateTasks", null);
exports.GenerateController = GenerateController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [generate_service_1.GenerateService])
], GenerateController);
//# sourceMappingURL=generate.controller.js.map