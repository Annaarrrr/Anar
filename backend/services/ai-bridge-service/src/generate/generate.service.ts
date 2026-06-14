import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { GenerateRequestDto } from '../dto/generate-request.dto';
import { GenerateResponseDto } from '../dto/generate-response.dto';
import { GenerateValidator } from './generate.validator';
import { GenerateFallback } from './generate.fallback';

/** Shape we expect in the LLM HTTP response body. */
interface LlmApiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable()
export class GenerateService {
  private readonly logger = new Logger(GenerateService.name);

  /** LLM request timeout in milliseconds — avoids hanging the user request. */
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
      const rawLlmOutput = await this.callLlm(dto.goalText);
      const result = this.validator.validate(rawLlmOutput);

      if (result.valid) {
        this.logger.log(`LLM path succeeded — returning ${result.tasks.length} tasks.`);
        return { tasks: result.tasks, source: 'llm' };
      }

      // LLM responded but shape was wrong — fall through to fallback.
      return this.useFallback(
        dto.goalText,
        `LLM response failed validation: ${result.reason}`,
      );
    } catch (error: unknown) {
      const reason = this.describeError(error);
      return this.useFallback(dto.goalText, reason);
    }
  }

  // ── Private: LLM call ─────────────────────────────────────────────

  private async callLlm(goalText: string): Promise<string> {
    const apiUrl = process.env.LLM_API_URL;
    const apiKey = process.env.LLM_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('LLM_API_URL or LLM_API_KEY env var is not set.');
    }

    const prompt = this.buildPrompt(goalText);

    this.logger.log(`Calling LLM at ${apiUrl} …`);

    const request$ = this.httpService
      .post<LlmApiResponse>(
        apiUrl,
        {
          model: process.env.LLM_MODEL ?? 'gpt-4o-mini',
          temperature: 0.4,
          messages: [
            {
              role: 'system',
              content:
                'You are a professional goal-planning assistant. ' +
                'You always respond with valid JSON only — no markdown, no prose.',
            },
            { role: 'user', content: prompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(timeout(GenerateService.LLM_TIMEOUT_MS));

    const response = await firstValueFrom(request$);

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM returned an empty content field.');

    this.logger.debug(`LLM raw response: ${content.slice(0, 200)}`);
    return content;
  }

  // ── Private: prompt engineering ───────────────────────────────────

  private buildPrompt(goalText: string): string {
    return (
      `Break down the following goal into exactly 3 to 5 specific, actionable tasks.\n\n` +
      `Goal: "${goalText}"\n\n` +
      `Respond ONLY with a JSON object in this exact shape — no extra keys, no markdown:\n` +
      `{\n  "tasks": ["Task 1", "Task 2", "Task 3"]\n}\n\n` +
      `Rules:\n` +
      `- Each task must be a clear, actionable sentence.\n` +
      `- Order tasks logically from first step to last.\n` +
      `- Do not number the tasks inside the strings.\n` +
      `- Return between 3 and 5 tasks — no more, no less.`
    );
  }

  // ── Private: fallback helper ──────────────────────────────────────

  private useFallback(goalText: string, reason: string): GenerateResponseDto {
    const tasks = this.fallback.getFallbackTasks(goalText, reason);
    return { tasks, source: 'fallback' };
  }

  private describeError(error: unknown): string {
    if (error instanceof TimeoutError) {
      return `LLM request timed out after ${GenerateService.LLM_TIMEOUT_MS}ms.`;
    }
    if (error instanceof Error) return error.message;
    return String(error);
  }
}