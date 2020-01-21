import {CLIEngine} from 'eslint';

/**
Format the lint results.

@param results - Contains the lint results for individual files.
@param data - Extended information related to the analysis results.
@returns The formatted output.
*/
declare function format(results: CLIEngine.LintResult[], data?: {}): string;

export = format;
