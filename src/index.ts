import chalk from 'chalk';
import eslint from 'eslint';
import plur from 'plur';
import Octokit from '@octokit/rest';

const PR_NUMBER = 1;
const octokit = new Octokit({
  auth: process.env.GH_TOKEN
});

function byErrorCount(
  a: eslint.CLIEngine.LintResult,
  b: eslint.CLIEngine.LintResult
) {
  if (a.errorCount === b.errorCount) {
    return b.warningCount - a.warningCount;
  }

  if (a.errorCount === 0) {
    return -1;
  }

  if (b.errorCount === 0) {
    return 1;
  }

  return b.errorCount - a.errorCount;
}

const formatter: eslint.CLIEngine.Formatter = results => {
  let errorCount = 0;
  let warningCount = 0;

  results.sort(byErrorCount).forEach(result => {
    const { messages } = result;

    if (messages.length === 0) {
      return;
    }

    errorCount += result.errorCount;
    warningCount += result.warningCount;
  });

  let output = '\n';

  if (warningCount > 0) {
    output += `${chalk.yellow(
      `${warningCount} ${plur('warning', warningCount)}`
    )}\n`;
  }

  if (errorCount > 0) {
    output += `${chalk.red(`${errorCount} ${plur('error', errorCount)}`)}\n`;
  }

  return errorCount + warningCount > 0 ? output || '' : '';
};

export = formatter;
