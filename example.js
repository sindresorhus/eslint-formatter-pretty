#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import eslintFormatterPretty from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Example ESLint results using actual existing files for testing hyperlinks
const results = [
	{
		filePath: path.join(__dirname, 'index.js'),
		errorCount: 2,
		warningCount: 1,
		messages: [
			{
				ruleId: 'no-console',
				severity: 1,
				message: 'Unexpected console statement.',
				line: 15,
				column: 3,
			},
			{
				ruleId: 'no-unused-vars',
				severity: 2,
				message: '\'validateEmail\' is defined but never used.',
				line: 8,
				column: 10,
			},
			{
				ruleId: 'prefer-const',
				severity: 2,
				message: '\'result\' is never reassigned. Use \'const\' instead.',
				line: 42,
				column: 5,
			},
		],
	},
	{
		filePath: path.join(__dirname, 'readme.md'),
		errorCount: 0,
		warningCount: 2,
		messages: [
			{
				ruleId: 'react/prop-types',
				severity: 1,
				message: '\'onClick\' is missing in props validation',
				line: 12,
				column: 15,
			},
			{
				ruleId: 'no-debugger',
				severity: 1,
				message: 'Unexpected \'debugger\' statement.',
				line: 25,
				column: 5,
			},
		],
	},
	{
		filePath: path.join(__dirname, 'test/test.js'),
		errorCount: 1,
		warningCount: 0,
		messages: [
			{
				ruleId: 'jest/no-disabled-tests',
				severity: 2,
				message: 'Skipped test',
				line: 45,
				column: 1,
			},
		],
	},
	{
		filePath: path.join(__dirname, 'package.json'),
		errorCount: 1,
		warningCount: 1,
		messages: [
			{
				ruleId: 'import/no-unresolved',
				severity: 2,
				message: 'Unable to resolve path to module \'./missing-module\'.',
				line: 5,
				column: 20,
			},
			{
				ruleId: 'no-warning-comments',
				severity: 1,
				message: 'Unexpected \'TODO\' comment: \'TODO: Add production config\'.',
				line: 28,
				column: 1,
			},
		],
	},
];

const data = {
	rulesMeta: {
		'no-console': {
			docs: {
				url: 'https://eslint.org/docs/rules/no-console',
			},
		},
		'no-unused-vars': {
			docs: {
				url: 'https://eslint.org/docs/rules/no-unused-vars',
			},
		},
		'prefer-const': {
			docs: {
				url: 'https://eslint.org/docs/rules/prefer-const',
			},
		},
		'react/prop-types': {
			docs: {
				url: 'https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md',
			},
		},
		'no-debugger': {
			docs: {
				url: 'https://eslint.org/docs/rules/no-debugger',
			},
		},
		'jest/no-disabled-tests': {
			docs: {
				url: 'https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/no-disabled-tests.md',
			},
		},
		'import/no-unresolved': {
			docs: {
				url: 'https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-unresolved.md',
			},
		},
		'no-warning-comments': {
			docs: {
				url: 'https://eslint.org/docs/rules/no-warning-comments',
			},
		},
	},
};

console.log('='.repeat(80));
console.log('ESLint Formatter Pretty - Example Output');
console.log('='.repeat(80));
console.log();
console.log('This example demonstrates:');
console.log('- File headers with clickable hyperlinks (using real files from this project)');
console.log('- Error/warning sorting and formatting');
console.log('- Rule IDs with hyperlinks to documentation');
console.log('- Multiple file results with different severity levels');
console.log();
console.log('✨ The file paths are real - click them to open in your editor!');
console.log();
console.log('Output:');
console.log('-'.repeat(80));

// Simulate TTY environment for demonstration (in real usage, ESLint runs in a TTY)
if (!process.env.FORCE_HYPERLINK) {
	process.stdout.isTTY = true;
}

// Test with hyperlinks (can be controlled via FORCE_HYPERLINK env var)
// If not set, will auto-detect based on terminal capabilities
const output = eslintFormatterPretty(results, data);
console.log(output);

console.log('-'.repeat(80));
console.log();
console.log('Notes:');
console.log('- In terminals with hyperlink support, file headers and rule IDs are clickable');
console.log('- File paths use actual files from this project (index.js, readme.md, etc.)');
console.log('- Files are sorted by error count (files with only warnings appear first)');
console.log('- Messages within files are sorted by severity, then line, then column');
if (!process.env.FORCE_HYPERLINK && process.stdout.isTTY) {
	console.log('- Hyperlinks auto-detected for this terminal');
} else if (process.env.FORCE_HYPERLINK === '1') {
	console.log('- Hyperlinks forced ON - click the file headers to test!');
} else {
	console.log('- Hyperlinks disabled or not supported in this environment');
}

console.log();
console.log('To force hyperlinks ON, run: FORCE_HYPERLINK=1 node example.js');
console.log('To force hyperlinks OFF, run: FORCE_HYPERLINK=0 node example.js');
console.log('To test iTerm Command-click, run: TERM_PROGRAM=iTerm.app FORCE_HYPERLINK=0 node example.js');
