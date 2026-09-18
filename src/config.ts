import * as vscode from 'vscode';
import { defaults, ExportOptions } from './types';

export function readConfig(uri: vscode.Uri): ExportOptions {
  const config = vscode.workspace.getConfiguration('codebaseMD', uri);
  const options = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof ExportOptions)[]) {
    (options as unknown as Record<string, unknown>)[key] = config.get(key, defaults[key]);
  }
  if (!['markdown', 'xml', 'text'].includes(options.format)) { options.format = defaults.format; }
  if (!['full', 'micro', 'skeleton'].includes(options.contentMode)) { options.contentMode = defaults.contentMode; }
  if (!['file', 'clipboard', 'editor'].includes(options.target)) { options.target = defaults.target; }
  if (!Number.isFinite(options.tokenBudget) || options.tokenBudget < 0) { options.tokenBudget = defaults.tokenBudget; }
  if (!Number.isFinite(options.maxFileSizeKB) || options.maxFileSizeKB < 1 || options.maxFileSizeKB > 102400) { options.maxFileSizeKB = defaults.maxFileSizeKB; }
  if (!Array.isArray(options.exclude) || options.exclude.some(value => typeof value !== 'string')) { options.exclude = []; }
  if (typeof options.customHeader !== 'string') { options.customHeader = ''; }
  for (const key of ['redactSecrets', 'respectGitignore', 'includeDiff', 'lineNumbers'] as const) {
    if (typeof options[key] !== 'boolean') { options[key] = defaults[key]; }
  }
  return options;
}
