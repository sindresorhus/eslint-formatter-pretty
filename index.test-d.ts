import type {ESLint} from 'eslint'; // eslint-disable-line import-x/no-extraneous-dependencies, n/no-extraneous-import
import {expectType} from 'tsd';
import eslintFormatterPretty, {
	type LintResult,
	type LintMessage,
} from './index.js';

// Test LintResult interface members
declare const lintResult: LintResult;
expectType<string>(lintResult.filePath);
expectType<number>(lintResult.errorCount);
expectType<number>(lintResult.warningCount);
expectType<LintMessage[]>(lintResult.messages);

// Test LintMessage interface members
const lintMessage = lintResult.messages[0];
expectType<1 | 2>(lintMessage.severity);
expectType<string>(lintMessage.message);
expectType<true | undefined>(lintMessage.fatal);
expectType<number>(lintMessage.line);
expectType<number>(lintMessage.column);
expectType<string | null>(lintMessage.ruleId); // eslint-disable-line @typescript-eslint/no-restricted-types

// Test formatterPretty()
declare const lintResults: LintResult[];
declare const eslintLintResults: ESLint.LintResult[];
declare const lintResultData: ESLint.LintResultData;

expectType<string>(eslintFormatterPretty(lintResults));
expectType<string>(eslintFormatterPretty(eslintLintResults));
expectType<string>(eslintFormatterPretty(eslintLintResults, lintResultData));
