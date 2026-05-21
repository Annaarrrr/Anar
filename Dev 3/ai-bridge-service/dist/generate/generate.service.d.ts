import { HttpService } from '@nestjs/axios';
import { GenerateRequestDto } from '../dto/generate-request.dto';
import { GenerateResponseDto } from '../dto/generate-response.dto';
export declare class GenerateService {
    private readonly httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    generateTasks(dto: GenerateRequestDto): Promise<GenerateResponseDto>;
}
