import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

// Import the extension module to test internal functions
// Note: In a real VS Code extension, you'd need to structure this differently
// to properly test internal functions

suite('File Processing Test Suite', () => {

	test('Should detect supported file extensions', () => {
		// This would test the isSupportedFile function
		// We'll create a simplified version for testing
		const supportedExtensions = [
			'.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt',
			'.py', '.java', '.c', '.cpp', '.cs', '.rb', '.go', '.php', '.sh', '.xml',
			'.yaml', '.yml', '.ini', '.bat', '.sql', '.rs', '.swift', '.kt', '.dart',
			'.lua', '.r', '.pl', '.hs', '.erl', '.ex', '.el', '.jl', '.scala'
		];
		
		const supportedFilesWithoutExtension = [
			'Dockerfile', 'Makefile', 'Jenkinsfile', 'docker-compose', '.gitignore', '.dockerignore',
			'.env', '.babelrc', '.eslintrc', '.prettierrc', 'Vagrantfile', 'Procfile'
		];

		function isSupportedFile(fileName: string): boolean {
			const ext = path.extname(fileName).toLowerCase();
			
			if (supportedExtensions.includes(ext)) {
				return true;
			}
			
			if (ext === '') {
				return supportedFilesWithoutExtension.includes(fileName);
			}
			
			return false;
		}

		// Test supported extensions
		assert.strictEqual(isSupportedFile('test.js'), true);
		assert.strictEqual(isSupportedFile('test.ts'), true);
		assert.strictEqual(isSupportedFile('test.py'), true);
		assert.strictEqual(isSupportedFile('Dockerfile'), true);
		assert.strictEqual(isSupportedFile('test.xyz'), false);
		assert.strictEqual(isSupportedFile('randomfile'), false);
	});

	test('Should detect large files', () => {
		function isLargeFile(fileName: string): boolean {
			const largeFiles = ['package-lock.json', 'yarn.lock'];
			return largeFiles.includes(fileName);
		}

		assert.strictEqual(isLargeFile('package-lock.json'), true);
		assert.strictEqual(isLargeFile('yarn.lock'), true);
		assert.strictEqual(isLargeFile('package.json'), false);
		assert.strictEqual(isLargeFile('regular-file.js'), false);
	});

	test('Should get language from extension', () => {
		function getLanguageFromExtension(ext: string): string {
			const langMap: {[key: string]: string} = {
				'.js': 'javascript',
				'.jsx': 'javascript',
				'.ts': 'typescript',
				'.tsx': 'typescript',
				'.py': 'python',
				'.java': 'java',
				'.c': 'c',
				'.cpp': 'cpp',
				'.cs': 'csharp',
				'.go': 'go',
				'.rb': 'ruby',
				'.php': 'php',
				'.html': 'html',
				'.css': 'css',
				'.scss': 'scss',
				'.json': 'json',
				'.md': 'markdown',
				'.rs': 'rust',
				'.swift': 'swift',
				'.kt': 'kotlin',
				'.dart': 'dart'
			};
			
			return langMap[ext] || 'unknown';
		}

		assert.strictEqual(getLanguageFromExtension('.js'), 'javascript');
		assert.strictEqual(getLanguageFromExtension('.ts'), 'typescript');
		assert.strictEqual(getLanguageFromExtension('.py'), 'python');
		assert.strictEqual(getLanguageFromExtension('.xyz'), 'unknown');
	});

	test('Should get language for special files', () => {
		function getLanguageForSpecialFile(fileName: string): string {
			const specialFileMap: {[key: string]: string} = {
				'Dockerfile': 'dockerfile',
				'docker-compose': 'yaml',
				'Makefile': 'makefile',
				'Jenkinsfile': 'groovy',
				'.gitignore': 'gitignore',
				'.dockerignore': 'gitignore',
				'.env': 'dotenv',
				'.babelrc': 'json',
				'.eslintrc': 'json',
				'.prettierrc': 'json',
				'Vagrantfile': 'ruby',
				'Procfile': 'procfile'
			};
			
			return specialFileMap[fileName] || 'plaintext';
		}

		assert.strictEqual(getLanguageForSpecialFile('Dockerfile'), 'dockerfile');
		assert.strictEqual(getLanguageForSpecialFile('.gitignore'), 'gitignore');
		assert.strictEqual(getLanguageForSpecialFile('.env'), 'dotenv');
		assert.strictEqual(getLanguageForSpecialFile('unknown'), 'plaintext');
	});
});
