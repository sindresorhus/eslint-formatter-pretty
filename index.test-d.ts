import {expectType} from 'tsd';
import {CLIEngine} from 'eslint';
import format = require('.');

const result: CLIEngine.LintResult = {
    filePath: 'fake-file.js',
    errorCount: 0,
    warningCount: 0,
    messages: [],
    fixableErrorCount: 0,
    fixableWarningCount: 0
};

expectType<string>(format([result]));
