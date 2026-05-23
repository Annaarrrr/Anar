import { OnModuleInit } from '@nestjs/common';
export declare class EmailProvider implements OnModuleInit {
    private readonly logger;
    private transporter;
    onModuleInit(): void;
    send(to: string, subject: string, body: string): Promise<void>;
}
