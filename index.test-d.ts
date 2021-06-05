import type {ESLint} from 'eslint';
import {expectType} from 'tsd';
import formatterPretty = require('.');

// Test type exports
type LintResult = formatterPretty.LintResult;
type LintMessage = formatterPretty.LintMessage;
type Severity = formatterPretty.Severity;

// Test LintResult interface members
declare const lintResult: LintResult;
expectType<string>(lintResult.filePath);
expectType<number>(lintResult.errorCount);
expectType<number>(lintResult.warningCount);
expectType<readonly LintMessage[]>(lintResult.messages);

// Test LintMessage interface members
const lintMessage = lintResult.messages[0];
expectType<Severity>(lintMessage.severity);
expectType<string>(lintMessage.message);
expectType<boolean | undefined>(lintMessage.fatal);
expectType<number | undefined>(lintMessage.line);
expectType<number | undefined>(lintMessage.column);
expectType<string | null | undefined>(lintMessage.ruleId);

// Test formatterPretty()
declare const lintResults: LintResult[];
declare const eslintLintResults: ESLint.LintResult[];
declare const lintResultData: ESLint.LintResultData;

expectType<string>(formatterPretty(lintResults));
expectType<string>(formatterPretty(eslintLintResults));
expectType<string>(formatterPretty(eslintLintResults, lintResultData));

interface PartialLintResult {
	filePath: string;
	errorCount: number;
	warningCount: number;
	messages: Array<{
		fileName: string;
		message: string;
		severity: 'error' | 'warning';
		line?: number;
		column?: number;
	}>;
}

declare const partialLintResults: PartialLintResult[];

expectType<string>(formatterPretty(partialLintResults));
