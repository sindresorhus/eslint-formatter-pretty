import { CLIEngine } from "eslint";

/**
 * Function formatting the lint results.
 * 
 * @param results - containing the lint results for individual files
 * @param data - extended information related to the analysis results
 * @returns - formatted output
 */
declare function format(results: CLIEngine.LintResult[], data?: {}): string;

export = format;
