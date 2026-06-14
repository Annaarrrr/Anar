import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { GenerateService } from './generate.service';
import { GenerateRequestDto } from '../dto/generate-request.dto';
import { GenerateResponseDto } from '../dto/generate-response.dto';

/**
 * GenerateController
 *
 * Exposes a single endpoint:
 *   POST /generate-tasks
 *
 * All routes in this controller are protected by AuthGuard.
 * Validation of the request body is handled globally by the
 * ValidationPipe registered in main.ts.
 */
@UseGuards(AuthGuard)
@Controller()
export class GenerateController {
  private readonly logger = new Logger(GenerateController.name);

  constructor(private readonly generateService: GenerateService) {}

  /**
   * POST /generate-tasks
   *
   * Accepts a goal description and returns an ordered list of tasks.
   * Never throws a 500 — the service layer has a built-in fallback.
   *
   * Example request:
   *   POST /generate-tasks
   *   Authorization: Bearer dev3-local-secret-token
   *   { "goalText": "I want to learn Spanish in 3 months" }
   *
   * Example response:
   *   {
   *     "tasks": ["Download Duolingo ...", "..."],
   *     "source": "llm"
   *   }
   */
  @Post('generate-tasks')
  @HttpCode(HttpStatus.OK)
  async generateTasks(
    @Body() dto: GenerateRequestDto,
  ): Promise<GenerateResponseDto> {
    this.logger.log(`POST /generate-tasks — goalText="${dto.goalText}"`);
    const result = await this.generateService.generateTasks(dto);
    this.logger.log(`POST /generate-tasks — source="${result.source}", tasks=${result.tasks.length}`);
    return result;
  }
}