import test from 'ava';
import stripAnsi from 'strip-ansi';
import m from '../';
import defaultFixture from './fixtures/default';
import noLineNumbers from './fixtures/no-line-numbers';
import lineNumbers from './fixtures/line-numbers';
import sortOrder from './fixtures/sort-by-severity-then-line-then-column';

test('output', t => {
	const output = m(defaultFixture);
	console.log(output);
	t.regex(stripAnsi(output), /index\.js:8:2\n/);
	t.regex(stripAnsi(output), /✖[ ]{3}1:1[ ]{2}AVA should be imported as test.[ ]{6}ava\/use-test/);
});

test('no line numbers', t => {
	const output = m(noLineNumbers);
	console.log(output);
	t.regex(stripAnsi(output), /index\.js\n/);
	t.regex(stripAnsi(output), /✖[ ]{2}AVA should be imported as test.[ ]{6}ava\/use-test/);
});

test('show line numbers', t => {
	const output = m(lineNumbers);
	console.log(output);
	t.regex(stripAnsi(output), /⚠[ ]{3}0:0[ ]{2}Unexpected todo comment.[ ]{13}no-warning-comments/);
	t.regex(stripAnsi(output), /✖[ ]{3}1:1[ ]{2}AVA should be imported as test.[ ]{6}ava\/use-test/);
});

test('sort by severity, then line number, then column number', t => {
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
	const output = m(sortOrder);
	const sanitized = stripAnsi(output);
	const indexes = [
		sanitized.indexOf('2 warnings'),
		sanitized.indexOf('4 errors')
	];
	console.log(output);
	t.deepEqual(indexes, indexes.slice().sort((a, b) => a - b));
});
