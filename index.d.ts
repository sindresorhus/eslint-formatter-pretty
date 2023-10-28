import type {ESLint, Linter} from 'eslint';

/**
Pretty formatter for [ESLint](https://eslint.org).

@param results - Lint result for the individual files.
@param data - Extended information related to the analysis results.
@returns The formatted output.
*/
export default function eslintFormatterPretty(
	results: LintResult[],
	data?: LintResultData
): string;

export type LintResult = ESLint.LintResult;
export type LintResultData = ESLint.LintResultData;
export type Severity = Linter.Severity;
export type LintMessage = Linter.LintMessage;

export {Linter} from 'eslint';
