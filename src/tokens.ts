// SPDX-FileCopyrightText: 2024-2026 Alphin Tom
//
// SPDX-License-Identifier: MIT

// File: src/tokens.ts
// What: Character-based token estimate.
// Why: Gives a model-independent size signal for budgets without bundling a tokenizer.
// Related: exporter.ts, formatters.ts

/** A model-independent heuristic, not a tokenizer or a context-limit guarantee. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
