import { GenerateRequestDto } from '../dto/generate-request.dto';
import { GenerateResponseDto } from '../dto/generate-response.dto';
import { GenerateService } from './generate.service';
export declare class GenerateController {
    private readonly generateService;
    constructor(generateService: GenerateService);
    generateTasks(dto: GenerateRequestDto): Promise<GenerateResponseDto>;
}
