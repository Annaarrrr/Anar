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
var GenerateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const generate_fallback_1 = require("./generate.fallback");
const REQUEST_TIMEOUT_MS = 5_000;
let GenerateService = GenerateService_1 = class GenerateService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(GenerateService_1.name);
    }
    async generateTasks(dto) {
        const llmApiUrl = process.env.LLM_API_URL;
        if (!llmApiUrl || llmApiUrl === 'MOCK_MODE') {
            this.logger.warn(`LLM_API_URL is "${llmApiUrl ?? 'empty'}" — returning fallback tasks.`);
            return { tasks: generate_fallback_1.FALLBACK_TASKS };
        }
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService
                .post(llmApiUrl, { goalText: dto.goalText })
                .pipe((0, operators_1.timeout)(REQUEST_TIMEOUT_MS)));
            return { tasks: response.data.tasks };
        }
        catch (err) {
            if (err instanceof rxjs_1.TimeoutError) {
                this.logger.error(`LLM API timed out after ${REQUEST_TIMEOUT_MS}ms — returning fallback tasks.`);
            }
            else {
                this.logger.error(`LLM API request failed: ${err?.message ?? err} — returning fallback tasks.`);
            }
            return { tasks: generate_fallback_1.FALLBACK_TASKS };
        }
    }
};
exports.GenerateService = GenerateService;
exports.GenerateService = GenerateService = GenerateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], GenerateService);
//# sourceMappingURL=generate.service.js.map