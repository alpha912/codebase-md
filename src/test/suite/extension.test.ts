import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('alpha912.codebase-md');
		assert.strictEqual(extension?.isActive, false);
		
		await extension?.activate();
		assert.strictEqual(extension?.isActive, true);
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands();
		
		assert.ok(commands.includes('codebaseMD.exportAll'));
		assert.ok(commands.includes('codebaseMD.exportSelected'));
		assert.ok(commands.includes('codebaseMD.exportMicro'));
		assert.ok(commands.includes('codebaseMD.exportMicroSelected'));
	});
});
