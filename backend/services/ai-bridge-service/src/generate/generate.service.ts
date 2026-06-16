import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { GenerateRequestDto } from '../dto/generate-request.dto';
import { GenerateResponseDto } from '../dto/generate-response.dto';
import { GenerateValidator } from './generate.validator';
import { GenerateFallback } from './generate.fallback';

/**
 * Shape returned by the FastAPI ai-logic service (POST /generate).
 * Mirrors the GenerateResponse Pydantic model in main.py.
 */
interface FastApiResponse {
  tasks: string[];
  main_goal: string;
  response_ar: string;
}

@Injectable()
export class GenerateService {
  private readonly logger = new Logger(GenerateService.name);

  /** Request timeout in ms — triggers fallback if FastAPI takes too long. */
  private static readonly LLM_TIMEOUT_MS = 15_000;

  constructor(
    private readonly httpService: HttpService,
    private readonly validator: GenerateValidator,
    private readonly fallback: GenerateFallback,
  ) {}

  // ── Public API ────────────────────────────────────────────────────

  async generateTasks(dto: GenerateRequestDto): Promise<GenerateResponseDto> {
    this.logger.log(`generateTasks() called | goalText="${dto.goalText}"`);

    try {
      // Call FastAPI ai-logic service and get raw response
      const fastApiData = await this.callFastApi(dto.goalText);

      // Wrap tasks in JSON string so GenerateValidator can parse it normally
      const rawForValidator = JSON.stringify({ tasks: fastApiData.tasks });
      const result = this.validator.validate(rawForValidator);

      if (result.valid) {
        this.logger.log(`AI pipeline succeeded — returning ${result.tasks.length} tasks.`);
        return {
          tasks: result.tasks,
          source: 'llm',
          main_goal: fastApiData.main_goal,
          response_ar: fastApiData.response_ar,
        };
      }

      // FastAPI responded but task shape was wrong — fall through to fallback
      return this.useFallback(
        dto.goalText,
        `AI response failed validation: ${result.reason}`,
      );
    } catch (error: unknown) {
      const reason = this.describeError(error);
      return this.useFallback(dto.goalText, reason);
    }
  }

  // ── Private: FastAPI call ─────────────────────────────────────────

  /**
   * Calls your Python FastAPI service (ai-logic) at POST /generate.
   * The FastAPI service internally runs:
   *   1. goal_prompt.py  → understands Arabic input → extracts main_goal
   *   2. task_prompt.py  → generates 4 Arabic tasks from main_goal
   */
  private async callFastApi(goalText: string): Promise<FastApiResponse> {
    const apiUrl = process.env.LLM_API_URL;

    if (!apiUrl) {
      throw new Error('LLM_API_URL is not set. Add it to your .env file.');
    }

    this.logger.log(`Calling FastAPI ai-logic at: ${apiUrl}`);
    this.logger.log(`Sending goalText: "${goalText}"`);

    const request$ = this.httpService
      .post<FastApiResponse>(
        apiUrl,
        { goalText }, // matches FastAPI GenerateRequest model: { goalText: str }
        { headers: { 'Content-Type': 'application/json' } },
      )
      .pipe(timeout(GenerateService.LLM_TIMEOUT_MS));

    const response = await firstValueFrom(request$);
    const data = response.data;

    // Validate the shape coming back from FastAPI
    if (!data || !Array.isArray(data.tasks) || data.tasks.length === 0) {
      throw new Error('FastAPI returned an unexpected or empty response shape.');
    }

    this.logger.log(`Extracted Arabic goal : "${data.main_goal}"`);
    this.logger.log(`Arabic confirmation   : "${data.response_ar}"`);
    this.logger.log(`Tasks received        : ${data.tasks.length}`);

    return data;
  }

  // ── Private: fallback helper ──────────────────────────────────────

  private useFallback(goalText: string, reason: string): GenerateResponseDto {
    this.logger.warn(`Activating fallback. Reason: ${reason}`);
    const tasks = this.fallback.getFallbackTasks(goalText, reason);
    return {
      tasks,
      source: 'fallback',
      main_goal: goalText,
      response_ar: 'عذراً، حدث خطأ. إليك بعض المهام الافتراضية للبدء.',
    };
  }

  private describeError(error: unknown): string {
    if (error instanceof TimeoutError) {
      return `FastAPI request timed out after ${GenerateService.LLM_TIMEOUT_MS}ms.`;
    }
    if (error instanceof Error) return error.message;
    return String(error);
  }
}