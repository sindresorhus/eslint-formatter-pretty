import type {ESLint} from 'eslint';
import {expectType} from 'tsd';
import eslintFormatterPretty, {
	type LintResult,
	type LintMessage,
	type Severity,
} from './index.js';

// Test LintResult interface members
declare const lintResult: LintResult;
expectType<string>(lintResult.filePath);
expectType<number>(lintResult.errorCount);
expectType<number>(lintResult.warningCount);
expectType<LintMessage[]>(lintResult.messages);

// Test LintMessage interface members
const lintMessage = lintResult.messages[0];
expectType<Severity>(lintMessage.severity);
expectType<string>(lintMessage.message);
expectType<true | undefined>(lintMessage.fatal);
expectType<number>(lintMessage.line);
expectType<number>(lintMessage.column);
expectType<string | null >(lintMessage.ruleId); // eslint-disable-line @typescript-eslint/ban-types

// Test formatterPretty()
declare const lintResults: LintResult[];
declare const eslintLintResults: ESLint.LintResult[];
declare const lintResultData: ESLint.LintResultData;

expectType<string>(eslintFormatterPretty(lintResults));
expectType<string>(eslintFormatterPretty(eslintLintResults));
expectType<string>(eslintFormatterPretty(eslintLintResults, lintResultData));

// FIXME
// type PartialLintResult = {
// 	filePath: string;
// 	errorCount: number;
// 	warningCount: number;
// 	messages: Array<{
// 		fileName: string;
// 		message: string;
// 		severity: 0 | 1 | 2;
// 		line?: number;
// 		column?: number;
// 	}>;
// };

// declare const partialLintResults: PartialLintResult[];

// expectType<string>(eslintFormatterPretty(partialLintResults));
