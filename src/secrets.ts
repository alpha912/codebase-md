export interface RedactionResult { text: string; count: number; }

/** Keep matches out of diagnostics; the result contains only sanitized text and a count. */
export function redactSecrets(input: string): RedactionResult {
  let count = 0;
  let text = input;
  const patterns = [
    /-----BEGIN (?:[A-Z ]*PRIVATE KEY)-----[\s\S]*?-----END (?:[A-Z ]*PRIVATE KEY)-----/g,
    /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
    /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g,
    /\bsk-(?:proj-|ant-[A-Za-z0-9]+-)?[A-Za-z0-9_-]{20,}\b/g,
    /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
    /\bAIza[A-Za-z0-9_-]{35}\b/g,
    /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
    /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g
  ];
  for (const pattern of patterns) {
    text = text.replace(pattern, () => { count++; return '***REDACTED***'; });
  }
  // Handles quoted JSON keys, source assignments, and unquoted dotenv values.
  text = text.replace(/((?:["']?[\w.-]*(?:password|passwd|secret|token|api[_-]?key|access[_-]?key)[\w.-]*["']?)\s*[:=]\s*)(["'`])([^\r\n]*?)\2/gi,
    (whole, prefix: string, quote: string, value: string) => {
      if (!value || value.includes('***REDACTED***')) { return whole; }
      count++; return `${prefix}${quote}***REDACTED***${quote}`;
    });
  text = text.replace(/^([+\- ]?\s*(?:export\s+)?[\w.-]*(?:password|passwd|secret|token|api[_-]?key|access[_-]?key)[\w.-]*\s*=\s*)([^\s"'`#][^\r\n]*)/gim,
    (whole, prefix: string, value: string) => {
      if (value.includes('***REDACTED***')) { return whole; }
      count++; return `${prefix}***REDACTED***`;
    });
  return { text, count };
}
