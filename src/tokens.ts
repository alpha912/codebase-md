/** A model-independent heuristic, not a tokenizer or a context-limit guarantee. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
