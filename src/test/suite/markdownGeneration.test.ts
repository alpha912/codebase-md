import * as assert from 'assert';
import * as path from 'path';
import { createMockFileSystem } from './mockFileSystem';

suite('Markdown Generation Test Suite', () => {
	const mockFS = createMockFileSystem();

	test('Should generate folder structure', () => {
		function generateFolderStructure(files: string[], rootPath: string): string {
			const tree: any = {};
			files.forEach(file => {
				const relativePath = file.replace(rootPath, '').replace(/^[\/\\]/, '');
				const parts = relativePath.split(/[\/\\]/);
				let current = tree;
				for (const part of parts) {
					if (!current[part]) {
						current[part] = {};
					}
					current = current[part];
				}
			});

			function printTree(node: any, prefix = ''): string {
				let result = '';
				for (const key in node) {
					result += `${prefix}${key}\n`;
					result += printTree(node[key], prefix + '  ');
				}
				return result;
			}

			return printTree(tree);
		}
		const structure = generateFolderStructure(mockFS.files, mockFS.rootPath);
		
		assert.ok(structure.includes('src'));
		assert.ok(structure.includes('package.json'));
		assert.ok(structure.includes('components'));
		assert.ok(structure.includes('App.tsx'));
		assert.ok(structure.includes('Button.tsx'));
	});

	test('Should extract file metadata', () => {
		function extractFileMetadata(code: string, language: string): { description: string; dependencies: string[] } {
			const lines = code.split('\n');
			let description = '';
			const dependencies: string[] = [];
			
			if (language === 'javascript' || language === 'typescript') {
				const importRegex = /import\s+.*?from\s+['"](.+?)['"]/g;
				let match;
				while ((match = importRegex.exec(code)) !== null) {
					dependencies.push(match[1]);
				}
			}
			
			for (let i = 0; i < Math.min(10, lines.length); i++) {
				const line = lines[i].trim();
				if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
					const comment = line.replace(/^\/\/|^\/\*|\*\/$|\*$/g, '').trim();
					if (comment && !comment.startsWith('@') && description.length < 100) {
						description += (description ? ' ' : '') + comment;
					}
				} else if (line !== '' && !line.startsWith('import') && !line.startsWith('package')) {
					break;
				}
			}
			
			return {
				description: description.substring(0, 100),
				dependencies: dependencies.slice(0, 5)
			};
		}

		const testCode = `// This is a test file
		// It demonstrates the functionality
		import * as vscode from 'vscode';
		import * as fs from 'fs';
		
		export function activate() {
			// Function implementation
		}`;

		const metadata = extractFileMetadata(testCode, 'typescript');
		
		assert.ok(metadata.description.includes('This is a test file'));
		assert.ok(metadata.dependencies.includes('vscode'));
		assert.ok(metadata.dependencies.includes('fs'));
	});

	test('Should analyze file structure for simple cases', () => {
		function analyzeSimpleStructure(code: string) {
			const components = [];
			const exports = [];
			const patterns = [];
			
			// Simple class detection
			const classMatch = code.match(/class\s+(\w+)/g);
			if (classMatch) {
				for (const match of classMatch) {
					const className = match.replace('class ', '');
					const isExported = code.includes(`export class ${className}`);
					
					const component = {
						type: 'class',
						name: className,
						visibility: isExported ? 'public' : 'private'
					};
					
					components.push(component);
					if (isExported) {
						exports.push(component);
					}
				}
			}
			
			// Simple function detection
			const functionMatch = code.match(/function\s+(\w+)/g);
			if (functionMatch) {
				for (const match of functionMatch) {
					const functionName = match.replace('function ', '');
					const isExported = code.includes(`export function ${functionName}`);
					
					const component = {
						type: 'function',
						name: functionName,
						visibility: isExported ? 'public' : 'private'
					};
					
					components.push(component);
					if (isExported) {
						exports.push(component);
					}
				}
			}
			
			// Pattern detection
			if (code.includes('async') || code.includes('await') || code.includes('Promise')) {
				patterns.push('Async/Promise pattern');
			}
			
			return { components, exports, patterns };
		}

		const testCode = `
		export class TestClass {
			constructor() {}
		}
		
		export function testFunction() {
			return Promise.resolve();
		}
		
		function privateFunction() {
			// Private implementation
		}`;

		const structure = analyzeSimpleStructure(testCode);
		
		assert.strictEqual(structure.components.length, 3);
		assert.strictEqual(structure.exports.length, 2);
		assert.ok(structure.patterns.includes('Async/Promise pattern'));
	});
});
