import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('alpha912.codebase-md');
		assert.ok(extension, 'Extension must be installed in the test host');
		
		await extension?.activate();
		assert.strictEqual(extension?.isActive, true);
	});

	test('Current-file command copies unsaved content with redaction in each format', async () => {
		const folder = vscode.workspace.workspaceFolders?.[0];
		assert.ok(folder, 'Test runner must provide a temporary workspace');
		const file = vscode.Uri.joinPath(folder!.uri, 'fixture.ts');
		const config = vscode.workspace.getConfiguration('codebaseMD', folder!.uri);
		const clipboard = await vscode.env.clipboard.readText();
		try {
			await config.update('tokenBudget', 0, vscode.ConfigurationTarget.Workspace);
			const editor = await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(file));
			await editor.edit(edit => edit.insert(new vscode.Position(0, 0), 'const password = "should-not-leak";\n'));
			for (const format of ['markdown', 'xml', 'text']) {
				await config.update('format', format, vscode.ConfigurationTarget.Workspace);
				await vscode.commands.executeCommand('codebaseMD.copyCurrentFile');
				const output = await vscode.env.clipboard.readText();
				assert.ok(output.includes('answer = 42'));
				assert.ok(output.includes('***REDACTED***'));
				assert.ok(!output.includes('should-not-leak'));
				if (format === 'xml') { assert.ok(output.startsWith('<?xml')); }
			}
		} finally {
			await vscode.env.clipboard.writeText(clipboard);
			await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
			await config.update('format', undefined, vscode.ConfigurationTarget.Workspace);
			await config.update('tokenBudget', undefined, vscode.ConfigurationTarget.Workspace);
		}
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands();
		
		assert.ok(commands.includes('codebaseMD.exportAll'));
		assert.ok(commands.includes('codebaseMD.exportSelected'));
		assert.ok(commands.includes('codebaseMD.exportMicro'));
		assert.ok(commands.includes('codebaseMD.exportMicroSelected'));
		assert.ok(commands.includes('codebaseMD.exportWizard'));
		assert.ok(commands.includes('codebaseMD.exportGitChanges'));
		assert.ok(commands.includes('codebaseMD.copyCurrentFile'));
	});
});
