import { expectType } from 'tsd';
import format = require('.');
import { CLIEngine } from 'eslint';

const r : CLIEngine.LintResult = {
    filePath: 'fakefile.test',
    errorCount: 0,
    warningCount: 0,
    messages: [],
    fixableErrorCount: 0,
    fixableWarningCount: 0 }

expectType<string>(format([r]));
