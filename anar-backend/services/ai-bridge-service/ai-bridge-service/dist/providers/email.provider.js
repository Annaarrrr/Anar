"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProvider = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let EmailProvider = EmailProvider_1 = class EmailProvider {
    constructor() {
        this.logger = new common_1.Logger(EmailProvider_1.name);
    }
    onModuleInit() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        this.logger.log(`Email transporter initialised -> ${process.env.SMTP_HOST}`);
    }
    async send(to, subject, body) {
        const info = await this.transporter.sendMail({
            from: `"AI Bridge" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html: body,
        });
        const messageId = info?.messageId || 'N/A';
        this.logger.log(`Email sent to ${to} - Message ID: ${messageId}`);
    }
};
exports.EmailProvider = EmailProvider;
exports.EmailProvider = EmailProvider = EmailProvider_1 = __decorate([
    (0, common_1.Injectable)()
], EmailProvider);
//# sourceMappingURL=email.provider.js.map