export type OutputFormat = 'markdown' | 'xml' | 'text';
export type ContentMode = 'full' | 'micro' | 'skeleton';
export type ExportTarget = 'file' | 'clipboard' | 'editor';
export interface ExportOptions {
  format: OutputFormat;
  contentMode: ContentMode;
  target: ExportTarget;
  tokenBudget: number;
  redactSecrets: boolean;
  maxFileSizeKB: number;
  exclude: string[];
  respectGitignore: boolean;
  includeDiff: boolean;
  lineNumbers: boolean;
  customHeader: string;
}
export const defaults: ExportOptions = {
  format: 'markdown', contentMode: 'full', target: 'file', tokenBudget: 32000,
  redactSecrets: true, maxFileSizeKB: 1024, exclude: [], respectGitignore: true,
  includeDiff: false, lineNumbers: false, customHeader: ''
};
export interface ExportFile {
  path: string;
  language: string;
  content: string;
  tokens: number;
  redactions: number;
  omitted?: string;
}
export interface ExportDocument {
  files: ExportFile[];
  mode: ContentMode;
  header: string;
  diff: string;
  redactions: number;
}
export interface ExportHooks {
  cancelled?: () => boolean;
  progress?: (message: string) => void;
  readText?: (absolutePath: string) => Promise<string | undefined>;
}
export class ExportCancelled extends Error {
  constructor() { super('Export cancelled.'); }
}
export function checkCancelled(hooks: ExportHooks): void {
  if (hooks.cancelled?.()) { throw new ExportCancelled(); }
}
