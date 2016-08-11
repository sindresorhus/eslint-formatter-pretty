import test from 'ava';
import stripAnsi from 'strip-ansi';
import m from '../';
import defaultFixture from './fixtures/default';
import noLineNumbers from './fixtures/no-line-numbers';
import lineNumbers from './fixtures/line-numbers';

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
