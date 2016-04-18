import test from 'ava';
import fixture from './fixture.json';
import m from './';

test(t => {
	const output = m(fixture);
	console.log(output);
	t.regex(output, /✖/);
});
