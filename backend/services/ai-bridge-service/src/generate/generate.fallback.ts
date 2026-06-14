import { Injectable, Logger } from '@nestjs/common';

/**
 * GenerateFallback
 *
 * Called by GenerateService whenever the LLM is unreachable, times out,
 * or returns an invalid response shape.
 *
 * Strategy: extract 1–2 meaningful keywords from the goalText and inject
 * them into three generic-but-contextual starter tasks, so the user still
 * receives something actionable rather than a 500 error.
 */
@Injectable()
export class GenerateFallback {
  private readonly logger = new Logger(GenerateFallback.name);

  /**
   * Returns 3 safe, context-aware fallback tasks derived from goalText.
   *
   * @param goalText  - The original user input forwarded from the controller.
   * @param reason    - Human-readable reason for the fallback (logged only).
   */
  getFallbackTasks(goalText: string, reason: string): string[] {
    this.logger.warn(`Activating fallback. Reason: ${reason}`);

    const keyword = this.extractKeyword(goalText);

    const tasks: string[] = [
      `Research and outline a clear plan for: "${keyword}"`,
      `Break down "${keyword}" into smaller, measurable milestones`,
      `Schedule a dedicated daily time block to make progress on "${keyword}"`,
    ];

    this.logger.log(`Fallback tasks generated for keyword="${keyword}": ${JSON.stringify(tasks)}`);
    return tasks;
  }

  // ── Private helpers ───────────────────────────────────────────────

  /**
   * Extracts the most meaningful short phrase from goalText:
   *  - Strips common filler words.
   *  - Returns the first 5 meaningful words joined, or the raw input
   *    truncated to 60 chars — whichever is shorter.
   */
  private extractKeyword(goalText: string): string {
    const FILLER = new Set([
      'i', 'want', 'to', 'a', 'an', 'the', 'my', 'me', 'be', 'become',
      'learn', 'how', 'so', 'that', 'can', 'will', 'need', 'would', 'like',
    ]);

    const meaningful = goalText
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !FILLER.has(w))
      .slice(0, 5)
      .join(' ');

    if (meaningful.length > 0) return meaningful;

    // Last resort: just truncate the raw input.
    return goalText.length > 60 ? `${goalText.slice(0, 60)}…` : goalText;
  }
}