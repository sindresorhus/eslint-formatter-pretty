import test from 'ava';
import fixture from './fixture';
import m from './';

test(t => {
	const output = m(fixture);
	console.log(output);
	t.regex(output, /✖/);
});
