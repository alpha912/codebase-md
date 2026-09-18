/** Best-effort outline. This deliberately does not claim to be a language parser. */
export function skeleton(code: string, language: string): string {
  const lines = code.split(/\r?\n/);
  const outline = lines.filter(line => {
    const value = line.trim();
    if (language === 'python') {
      return /^(?:from\s|import\s|(?:async\s+)?def\s|class\s|@)/.test(value);
    }
    return /^(?:import\s|from\s|package\s|using\s|#include|(?:export\s+)?(?:default\s+)?(?:abstract\s+)?(?:class|interface|enum|type|struct|trait)\s|(?:export\s+)?(?:async\s+)?function\s|(?:pub\s+)?(?:async\s+)?(?:fn|func)\s)/.test(value)
      || /^(?:(?:export|public|private|protected|static|async|override|readonly)\s+)*(?:const|let|var)\s+\w+.*=>/.test(value)
      || /^(?:(?:public|private|protected|static|async|override)\s+)*[\w<>\[\]?]+\s+\w+\s*\(/.test(value)
      || /^(?:(?:public|private|protected|static|async|override)\s+)*\w+\s*\([^)]*\)\s*(?::[^=]+)?\s*\{/.test(value) && !/^(?:if|for|while|switch|catch|with)\b/.test(value);
  });
  if (!outline.length) { return code; }
  return '// Best-effort outline; bodies omitted; multiline signatures may be incomplete.\n'
    + outline.map(line => {
      if (line.includes('=>')) { return line.slice(0, line.indexOf('=>') + 2) + ' …'; }
      const start = line.indexOf('{');
      // Preserve import bindings and type declarations; collapse apparent bodies.
      return start >= 0 && !/^\s*(?:import|from|(?:export\s+)?type)\b/.test(line)
        ? line.slice(0, start).trimEnd() + ' { … }' : line;
    }).join('\n');
}
