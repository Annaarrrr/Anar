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
interface StageItem {
  label: string;
  sublabel: string;
  emoji: string;
  tasks: string[];
}

interface FastApiResponse {
  stages: StageItem[];
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

      // Wrap stages in JSON string so GenerateValidator can parse it normally
      const rawForValidator = JSON.stringify({ stages: fastApiData.stages });
      const result = this.validator.validate(rawForValidator);

      if (result.valid) {
        this.logger.log(`AI pipeline succeeded — returning ${result.stages.length} stages.`);
        return {
          stages: result.stages,
          source: 'llm',
          main_goal: fastApiData.main_goal,
          response_ar: fastApiData.response_ar,
        };
      }

      // FastAPI responded but shape was wrong — fall through to fallback
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
    if (!data || !Array.isArray(data.stages) || data.stages.length === 0) {
      throw new Error('FastAPI returned an unexpected or empty response shape.');
    }

    this.logger.log(`Extracted Arabic goal : "${data.main_goal}"`);
    this.logger.log(`Arabic confirmation   : "${data.response_ar}"`);
    this.logger.log(`Stages received       : ${data.stages.length}`);

    return data;
  }

  async chat(messages: Array<{ role: string; content: string }>, lang: string): Promise<{ response_ar: string; suggestedGoal: string | null }> {
    this.logger.log(`chat() called with ${messages.length} messages, lang=${lang}`);
    const apiUrl = process.env.LLM_API_URL;
    if (!apiUrl) {
      throw new Error('LLM_API_URL is not set.');
    }
    const chatUrl = apiUrl.replace('/generate', '/chat');

    try {
      const request$ = this.httpService
        .post<{ response_ar: string; suggestedGoal: string | null }>(
          chatUrl,
          { messages, lang },
          { headers: { 'Content-Type': 'application/json' } },
        )
        .pipe(timeout(GenerateService.LLM_TIMEOUT_MS));

      const response = await firstValueFrom(request$);
      return response.data;
    } catch (error: unknown) {
      this.logger.error(`FastAPI chat request failed: ${this.describeError(error)}`);
      return {
        response_ar: 'معلش يا بطل، في مشكلة في السيرفر حالياً. قولي تاني حابب تركز على إيه؟',
        suggestedGoal: null
      };
    }
  }

  // ── Private: fallback helper ──────────────────────────────────────

  private useFallback(goalText: string, reason: string): GenerateResponseDto {
    this.logger.warn(`Activating fallback. Reason: ${reason}`);
    const tasks = this.fallback.getFallbackTasks(goalText, reason);
    return {
      stages: [{
        label: "الأساسيات",
        sublabel: "البداية",
        emoji: "🚀",
        tasks: tasks
      }],
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