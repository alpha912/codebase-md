import * as path from 'path';
import * as fs from 'fs';
import Mocha = require('mocha');

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
		timeout: 10000
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		try {
			function addTests(directory: string): void {
				for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
					const file = path.join(directory, entry.name);
					if (entry.isDirectory()) { addTests(file); }
					else if (entry.name.endsWith('.test.js')) { mocha.addFile(file); }
				}
			}
			addTests(testsRoot);
			mocha.run((failures: number) => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (err) {
			console.error(err);
			e(err);
		}
	});
}
