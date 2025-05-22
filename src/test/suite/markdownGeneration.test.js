"use strict";
exports.__esModule = true;
var assert = require("assert");
var mockFileSystem_1 = require("./mockFileSystem");
suite('Markdown Generation Test Suite', function () {
    var mockFS = (0, mockFileSystem_1.createMockFileSystem)();
    test('Should generate folder structure', function () {
        function generateFolderStructure(files, rootPath) {
            var tree = {};
            files.forEach(function (file) {
                var relativePath = file.replace(rootPath, '').replace(/^[\/\\]/, '');
                var parts = relativePath.split(/[\/\\]/);
                var current = tree;
                for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                    var part = parts_1[_i];
                    if (!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];
                }
            });
            function printTree(node, prefix) {
                if (prefix === void 0) { prefix = ''; }
                var result = '';
                for (var key in node) {
                    result += "".concat(prefix).concat(key, "\n");
                    result += printTree(node[key], prefix + '  ');
                }
                return result;
            }
            return printTree(tree);
        }
        var structure = generateFolderStructure(mockFS.files, mockFS.rootPath);
        assert.ok(structure.includes('src'));
        assert.ok(structure.includes('package.json'));
        assert.ok(structure.includes('components'));
        assert.ok(structure.includes('App.tsx'));
        assert.ok(structure.includes('Button.tsx'));
    });
    test('Should extract file metadata', function () {
        function extractFileMetadata(code, language) {
            var lines = code.split('\n');
            var description = '';
            var dependencies = [];
            if (language === 'javascript' || language === 'typescript') {
                var importRegex = /import\s+.*?from\s+['"](.+?)['"]/g;
                var match = void 0;
                while ((match = importRegex.exec(code)) !== null) {
                    dependencies.push(match[1]);
                }
            }
            for (var i = 0; i < Math.min(10, lines.length); i++) {
                var line = lines[i].trim();
                if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
                    var comment = line.replace(/^\/\/|^\/\*|\*\/$|\*$/g, '').trim();
                    if (comment && !comment.startsWith('@') && description.length < 100) {
                        description += (description ? ' ' : '') + comment;
                    }
                }
                else if (line !== '' && !line.startsWith('import') && !line.startsWith('package')) {
                    break;
                }
            }
            return {
                description: description.substring(0, 100),
                dependencies: dependencies.slice(0, 5)
            };
        }
        var testCode = "// This is a test file\n\t\t// It demonstrates the functionality\n\t\timport * as vscode from 'vscode';\n\t\timport * as fs from 'fs';\n\t\t\n\t\texport function activate() {\n\t\t\t// Function implementation\n\t\t}";
        var metadata = extractFileMetadata(testCode, 'typescript');
        assert.ok(metadata.description.includes('This is a test file'));
        assert.ok(metadata.dependencies.includes('vscode'));
        assert.ok(metadata.dependencies.includes('fs'));
    });
    test('Should analyze file structure for simple cases', function () {
        function analyzeSimpleStructure(code) {
            var components = [];
            var exports = [];
            var patterns = [];
            // Simple class detection
            var classMatch = code.match(/class\s+(\w+)/g);
            if (classMatch) {
                for (var _i = 0, classMatch_1 = classMatch; _i < classMatch_1.length; _i++) {
                    var match = classMatch_1[_i];
                    var className = match.replace('class ', '');
                    var isExported = code.includes("export class ".concat(className));
                    var component = {
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
            var functionMatch = code.match(/function\s+(\w+)/g);
            if (functionMatch) {
                for (var _a = 0, functionMatch_1 = functionMatch; _a < functionMatch_1.length; _a++) {
                    var match = functionMatch_1[_a];
                    var functionName = match.replace('function ', '');
                    var isExported = code.includes("export function ".concat(functionName));
                    var component = {
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
            return { components: components, exports: exports, patterns: patterns };
        }
        var testCode = "\n\t\texport class TestClass {\n\t\t\tconstructor() {}\n\t\t}\n\t\t\n\t\texport function testFunction() {\n\t\t\treturn Promise.resolve();\n\t\t}\n\t\t\n\t\tfunction privateFunction() {\n\t\t\t// Private implementation\n\t\t}";
        var structure = analyzeSimpleStructure(testCode);
        assert.strictEqual(structure.components.length, 3);
        assert.strictEqual(structure.exports.length, 2);
        assert.ok(structure.patterns.includes('Async/Promise pattern'));
    });
});
