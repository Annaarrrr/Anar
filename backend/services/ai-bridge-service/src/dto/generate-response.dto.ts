export class GenerateResponseDto {
  /**
   * Ordered list of actionable task strings generated (or fallen back to)
   * from the LLM for the given goalText.
   * Always contains between 3 and 5 items.
   */
  tasks!: string[];

  /**
   * Indicates whether these tasks were produced by the live LLM or the
   * built-in fallback. Useful for observability / analytics downstream.
   */
  source!: 'llm' | 'fallback';
}