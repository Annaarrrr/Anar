import { Injectable, Logger } from '@nestjs/common';

export interface StageItem {
  label: string;
  sublabel: string;
  emoji: string;
  tasks: string[];
}

export interface ValidationResult {
  valid: boolean;
  stages: StageItem[];
  reason?: string;
}

@Injectable()
export class GenerateValidator {
  private readonly logger = new Logger(GenerateValidator.name);

  validate(raw: string): ValidationResult {
    let parsed: unknown;
    try {
      const cleaned = this.stripMarkdownFences(raw);
      parsed = JSON.parse(cleaned);
    } catch {
      return this.fail(`LLM response is not valid JSON. Raw snippet: "${raw.slice(0, 120)}…"`);
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return this.fail('Parsed JSON is not an object.');
    }

    const obj = parsed as Record<string, unknown>;

    if (!Object.prototype.hasOwnProperty.call(obj, 'stages')) {
      return this.fail('Parsed JSON does not contain a "stages" key.');
    }

    if (!Array.isArray(obj['stages'])) {
      return this.fail('"stages" is not an array.');
    }

    const rawStages = obj['stages'] as unknown[];
    const stages: StageItem[] = [];

    for (let i = 0; i < rawStages.length; i++) {
      const item = rawStages[i] as any;
      if (!item || typeof item !== 'object') return this.fail(`stages[${i}] is not an object`);
      if (typeof item.label !== 'string') return this.fail(`stages[${i}].label missing`);
      if (typeof item.sublabel !== 'string') return this.fail(`stages[${i}].sublabel missing`);
      if (typeof item.emoji !== 'string') return this.fail(`stages[${i}].emoji missing`);
      if (!Array.isArray(item.tasks)) return this.fail(`stages[${i}].tasks is not an array`);
      
      const tasks: string[] = [];
      for (let j = 0; j < item.tasks.length; j++) {
        const t = item.tasks[j];
        if (typeof t === 'string' && t.trim().length > 0) tasks.push(t.trim());
      }
      
      stages.push({
        label: item.label.trim(),
        sublabel: item.sublabel.trim(),
        emoji: item.emoji.trim(),
        tasks
      });
    }

    this.logger.log(`Validation passed — ${stages.length} stages accepted from LLM.`);
    return { valid: true, stages };
  }

  // ── Private helpers ───────────────────────────────────────────────

  /**
   * Strips ```json ... ``` or ``` ... ``` fences that LLMs frequently add
   * around JSON output even when explicitly told not to.
   */
  private stripMarkdownFences(raw: string): string {
    return raw
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }

  private fail(reason: string): ValidationResult {
    this.logger.warn(`Validation failed — ${reason}`);
    return { valid: false, stages: [], reason };
  }
}