import { Injectable, Logger } from '@nestjs/common';

export interface ValidationResult {
  valid: boolean;
  tasks: string[];
  reason?: string;
}

/**
 * GenerateValidator
 *
 * Responsible for one thing: deciding whether what the LLM returned
 * is safe to hand back to the caller.
 *
 * Rules enforced:
 *  1. The raw string must be parseable as JSON.
 *  2. The parsed value must contain a `tasks` key that is an array.
 *  3. Every element in that array must be a non-empty string.
 *  4. The array length must be between MIN_TASKS and MAX_TASKS (3–5).
 */
@Injectable()
export class GenerateValidator {
  private readonly logger = new Logger(GenerateValidator.name);

  // generate.validator.ts — change these two lines
static readonly MIN_TASKS = 4;  // was 3
static readonly MAX_TASKS = 4;  // was 5

  validate(raw: string): ValidationResult {
    // ── Step 1: Parse JSON ──────────────────────────────────────────
    let parsed: unknown;
    try {
      // LLMs often wrap JSON in markdown fences — strip them first.
      const cleaned = this.stripMarkdownFences(raw);
      parsed = JSON.parse(cleaned);
    } catch {
      return this.fail(`LLM response is not valid JSON. Raw snippet: "${raw.slice(0, 120)}…"`);
    }

    // ── Step 2: Expect an object with a `tasks` array ───────────────
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return this.fail('Parsed JSON is not an object.');
    }

    const obj = parsed as Record<string, unknown>;

    if (!Object.prototype.hasOwnProperty.call(obj, 'tasks')) {
      return this.fail('Parsed JSON does not contain a "tasks" key.');
    }

    if (!Array.isArray(obj['tasks'])) {
      return this.fail('"tasks" is not an array.');
    }

    const rawTasks = obj['tasks'] as unknown[];

    // ── Step 3: All elements must be non-empty strings ───────────────
    const tasks: string[] = [];
    for (let i = 0; i < rawTasks.length; i++) {
      const item = rawTasks[i];
      if (typeof item !== 'string' || item.trim().length === 0) {
        return this.fail(`tasks[${i}] is not a non-empty string (got: ${JSON.stringify(item)}).`);
      }
      tasks.push(item.trim());
    }

    // ── Step 4: Enforce 3–5 task count ──────────────────────────────
    if (tasks.length < GenerateValidator.MIN_TASKS || tasks.length > GenerateValidator.MAX_TASKS) {
      return this.fail(
        `Expected ${GenerateValidator.MIN_TASKS}–${GenerateValidator.MAX_TASKS} tasks, got ${tasks.length}.`,
      );
    }

    this.logger.log(`Validation passed — ${tasks.length} tasks accepted from LLM.`);
    return { valid: true, tasks };
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
    return { valid: false, tasks: [], reason };
  }
}