/* eslint "ava/no-import-test-files": "off" */
import test from 'ava';
import stripAnsi from 'strip-ansi';
import ansiEscapes from 'ansi-escapes';
import chalk from 'chalk';
import defaultFixture from './fixtures/default.json';
import noLineNumbers from './fixtures/no-line-numbers.json';
import lineNumbers from './fixtures/line-numbers.json';
import sortOrder from './fixtures/sort-by-severity-then-line-then-column.json';
import messages from './fixtures/messages.json';
import data from './fixtures/data.json';
import eslintFormatterPretty from '..';

const fakeMessages = (desiredSeverity, desiredCount) => {
	const ofDesiredSeverity = messages.filter(({severity}) => severity === desiredSeverity);

	if (ofDesiredSeverity.length < desiredCount) {
		throw new Error(
			`requested ${desiredCount} messages with severity ${desiredSeverity}. Only found ${desiredSeverity.length}.`
		);
	}

	return ofDesiredSeverity.slice(0, desiredCount);
};

const fakeReport = (errorCount, warningCount) => ({
	filePath: `${errorCount}-error.${warningCount}-warning.js`,
	errorCount,
	warningCount,
	messages: fakeMessages(1, warningCount).concat(fakeMessages(2, errorCount))
});

const enableHyperlinks = () => {
	process.env.FORCE_HYPERLINK = '1';
};

const disableHyperlinks = () => {
	process.env.FORCE_HYPERLINK = '0';
};

test('output', t => {
	disableHyperlinks();
	const output = eslintFormatterPretty(defaultFixture);
	console.log(output);
	t.regex(stripAnsi(output), /index\.js:18:2\n/);
	t.regex(stripAnsi(output), /✖ {3}1:1 {2}AVA should be imported as test. {6}ava\/use-test/);
});

test('file heading links to the first error line', t => {
	disableHyperlinks();
	const output = eslintFormatterPretty(defaultFixture);
	console.log(output);
	t.regex(stripAnsi(output), /index\.js:18:2\n/);
});

test('file heading links to the first warning line if no errors in the file', t => {
	disableHyperlinks();
	const output = eslintFormatterPretty(defaultFixture);
	console.log(output);
	t.regex(stripAnsi(output), /test\.js:1:1\n/);
});

test('no line numbers', t => {
	disableHyperlinks();
	const output = eslintFormatterPretty(noLineNumbers);
	console.log(output);
	t.regex(stripAnsi(output), /index\.js\n/);
	t.regex(stripAnsi(output), /✖ {2}AVA should be imported as test. {6}ava\/use-test/);
});

test('show line numbers', t => {
	disableHyperlinks();
	const output = eslintFormatterPretty(lineNumbers);
	console.log(output);
	t.regex(stripAnsi(output), /⚠ {3}0:0 {2}Unexpected todo comment. {13}no-warning-comments/);
	t.regex(stripAnsi(output), /✖ {3}1:1 {2}AVA should be imported as test. {6}ava\/use-test/);
});

test('link rules to documentation when terminal supports links', t => {
	enableHyperlinks();
	const output = eslintFormatterPretty(defaultFixture);
	console.log(output);
	t.true(output.includes(ansiEscapes.link(chalk.dim('no-warning-comments'), 'https://eslint.org/docs/rules/no-warning-comments')));
});

test('sort by severity, then line number, then column number', t => {
	disableHyperlinks();
	const output = eslintFormatterPretty(sortOrder);
	const sanitized = stripAnsi(output);
	const indexes = [
		sanitized.indexOf('⚠   1:1'),
		sanitized.indexOf('⚠  10:2'),
		sanitized.indexOf('✖   3:1'),
		sanitized.indexOf('✖  30:1'),
		sanitized.indexOf('✖  40:5'),
		sanitized.indexOf('✖  40:8')
	];
	console.log(output);
	t.deepEqual(indexes, indexes.slice().sort((a, b) => a - b));
});

test('display warning total before error total', t => {
	disableHyperlinks();
	const output = eslintFormatterPretty(sortOrder);
	const sanitized = stripAnsi(output);
	const indexes = [
		sanitized.indexOf('2 warnings'),
		sanitized.indexOf('4 errors')
	];
	console.log(output);
	t.deepEqual(indexes, indexes.slice().sort((a, b) => a - b));
});

test('files will be sorted with least errors at the bottom, but zero errors at the top', t => {
	disableHyperlinks();
	const reports = [
		fakeReport(1, 0),
		fakeReport(3, 0),
		fakeReport(0, 1),
		fakeReport(2, 2)
	];
	const output = eslintFormatterPretty(reports);
	const sanitized = stripAnsi(output);
	const indexes = [
		sanitized.indexOf('0-error.1-warning.js'),
		sanitized.indexOf('3-error.0-warning.js'),
		sanitized.indexOf('2-error.2-warning.js'),
		sanitized.indexOf('1-error.0-warning.js')
	];
	console.log(output);
	t.is(indexes.length, reports.length);
	t.deepEqual(indexes, indexes.slice().sort((a, b) => a - b));
});

test('files with similar errorCounts will sort according to warningCounts', t => {
	disableHyperlinks();
	const reports = [
		fakeReport(1, 0),
		fakeReport(1, 2),
		fakeReport(1, 1),
		fakeReport(0, 1),
		fakeReport(0, 2),
		fakeReport(0, 3),
		fakeReport(2, 2),
		fakeReport(2, 1)
	];
	const output = eslintFormatterPretty(reports);
	const sanitized = stripAnsi(output);
	const indexes = [
		sanitized.indexOf('0-error.3-warning.js'),
		sanitized.indexOf('0-error.2-warning.js'),
		sanitized.indexOf('0-error.1-warning.js'),
		sanitized.indexOf('2-error.2-warning.js'),
		sanitized.indexOf('2-error.1-warning.js'),
		sanitized.indexOf('1-error.2-warning.js'),
		sanitized.indexOf('1-error.1-warning.js'),
		sanitized.indexOf('1-error.0-warning.js')
	];
	console.log(output);
	t.is(indexes.length, reports.length);
	t.deepEqual(indexes, indexes.slice().sort((a, b) => a - b));
});

test('use the `rulesMeta` property to get docs URL', t => {
	enableHyperlinks();
	const output = eslintFormatterPretty(defaultFixture, data);
	console.log(output);
	t.true(output.includes(ansiEscapes.link(chalk.dim('no-warning-comments'), 'https://eslint.org/docs/rules/test/no-warning-comments')));
});

test('doesn\'t throw errors when rule docs aren\'t found', t => {
	enableHyperlinks();
	const output = eslintFormatterPretty(defaultFixture, data);
	console.log(output);
	t.true(output.includes('@typescript-eslint/no-unused-vars'));
});
