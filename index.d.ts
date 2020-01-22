import {CLIEngine} from 'eslint';

/**
Format the lint results.

@param results - Lint result for the individual files.
@param data - Extended information related to the analysis results.
@returns The formatted output.
*/
declare const format: CLIEngine.Formatter;

export = format;
