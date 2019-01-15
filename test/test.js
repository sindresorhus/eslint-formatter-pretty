import test from 'ava';
import stripAnsi from 'strip-ansi';
import ansiEscapes from 'ansi-escapes';
import chalk from 'chalk';
import m from '..';
import defaultFixture from './fixtures/default';
import noLineNumbers from './fixtures/no-line-numbers';
import lineNumbers from './fixtures/line-numbers';
import lineNumbersNoSource from './fixtures/line-numbers-no-source';
import sortOrder from './fixtures/sort-by-severity-then-line-then-column';
import messages from './fixtures/messages';

const severityFilter = desiredSeverity => ({severity}) => severity === desiredSeverity;

const fakeMessages = (desiredSeverity, desiredCount) => {
	const ofDesiredSeverity = messages.filter(severityFilter(desiredSeverity));

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

test.beforeEach(() => {
	m.terminalWidth = 150;
});

test('output', t => {
	disableHyperlinks();
	const output = m(defaultFixture);
	console.log(output);
	t.regex(stripAnsi(output), /index\.js:8:2\n/);
	t.regex(stripAnsi(output), /✖[ ]{3}1:1[ ]{2}AVA should be imported as test.[ ]{6}ava\/use-test/);
});

test('no line numbers', t => {
	disableHyperlinks();
	const output = m(noLineNumbers);
	console.log(output);
	t.regex(stripAnsi(output), /index\.js\n/);
	t.regex(stripAnsi(output), /✖[ ]{2}AVA should be imported as test.[ ]{6}ava\/use-test/);
});

test('show line numbers', t => {
	disableHyperlinks();
	const output = m(lineNumbers);
	console.log(output);
	t.regex(stripAnsi(output), /⚠[ ]{3}0:0[ ]{2}TODO: fix this later[ ]{17}no-warning-comments/);
	t.regex(stripAnsi(output), /✖[ ]{3}1:1[ ]{2}AVA should be imported as test.[ ]{6}ava\/use-test/);
});

test('link rules to documentation when terminal supports links', t => {
	enableHyperlinks();
	const output = m(defaultFixture);
	console.log(output);
	t.true(output.includes(ansiEscapes.link(chalk.dim('no-warning-comments'), 'https://eslint.org/docs/rules/no-warning-comments')));
});

test('sort by severity, then line number, then column number', t => {
	disableHyperlinks();
	const output = m(sortOrder);
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
	const output = m(sortOrder);
	const sanitized = stripAnsi(output);
	const indexes = [
		sanitized.indexOf('2 warnings'),
		sanitized.indexOf('4 errors')
	];
	console.log(output);
	t.deepEqual(indexes, indexes.slice().sort((a, b) => a - b));
});

test('long messages will be truncated', t => {
	disableHyperlinks();
	m.terminalWidth = 56;
	const output = m(lineNumbers);
	console.log(output);
	t.regex(stripAnsi(output), /⚠[ ]{3}0:0[ ]{2}TODO: fix this later[ ]{2}no-warning-comments/);
	t.regex(stripAnsi(output), /✖[ ]{3}1:1[ ]{2}AVA should be impor…[ ]{2}ava\/use-test/);
});

test('drop the ruleId before truncating warning comments"', t => {
	disableHyperlinks();
	m.terminalWidth = 54;
	const output = m(lineNumbers);
	console.log(output);
	t.regex(stripAnsi(output), /⚠[ ]{3}0:0[ ]{2}TODO: fix this later/);
	t.regex(stripAnsi(output), /✖[ ]{3}1:1[ ]{2}AVA should be imp…[ ]{2}ava\/use-test/);
});

test('gracefully handle missing source for warning comments', t => {
	disableHyperlinks();
	const output = m(lineNumbersNoSource);
	console.log(output);
	t.regex(stripAnsi(output), /⚠[ ]{3}0:0[ ]{2}Unexpected todo comment.[ ]{13}no-warning-comments/);
	t.regex(stripAnsi(output), /✖[ ]{3}1:1[ ]{2}AVA should be imported as test.[ ]{6}ava\/use-test/);
});

test('files will be sorted with least errors at the bottom, but zero errors at the top', t => {
	disableHyperlinks();
	const reports = [
		fakeReport(1, 0),
		fakeReport(3, 0),
		fakeReport(0, 1),
		fakeReport(2, 2)
	];
	const output = m(reports);
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
	const output = m(reports);
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
