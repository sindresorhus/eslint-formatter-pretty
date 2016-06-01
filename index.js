'use strict';
const path = require('path');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const plur = require('plur');
const stringWidth = require('string-width');
const ansiEscapes = require('ansi-escapes');
const repeating = require('repeating');

module.exports = results => {
	const lines = [];
	let errorCount = 0;
	let warningCount = 0;
	let maxLineWidth = 0;
	let maxColumnWidth = 0;
	let maxMessageWidth = 0;
	let showLineNumbers = false;

	results
		.sort((a, b) => b.errorCount - a.errorCount)
		.forEach(result => {
			const messages = result.messages;

			if (messages.length === 0) {
				return;
			}

			errorCount += result.errorCount;
			warningCount += result.warningCount;

			if (lines.length !== 0) {
				lines.push({type: 'separator'});
			}

			const filePath = result.filePath;

			lines.push({
				type: 'header',
				filePath,
				relativeFilePath: path.relative('.', filePath),
				firstLineCol: messages[0].line + ':' + messages[0].column
			});

			messages
				.sort((a, b) => {
					const condition = (a.fatal || a.severity === 2) && (!b.fatal || b.severity !== 2);

					if (condition) {
						return 1;
					}

					if (!condition) {
						return -1;
					}

					return 0;
				})
				.forEach(x => {
					let message = x.message;

					// stylize inline code blocks
					message = message.replace(/\B`(.*?)`\B|\B'(.*?)'\B/g, (m, p1, p2) => chalk.bold(p1 || p2));

					const line = String(x.line || 0);
					const column = String(x.column || 0);
					const lineWidth = stringWidth(line);
					const columnWidth = stringWidth(column);
					const messageWidth = stringWidth(message);

					maxLineWidth = Math.max(lineWidth, maxLineWidth);
					maxColumnWidth = Math.max(columnWidth, maxColumnWidth);
					maxMessageWidth = Math.max(messageWidth, maxMessageWidth);
					showLineNumbers = showLineNumbers || x.line || x.column;

					lines.push({
						type: 'message',
						severity: (x.fatal || x.severity === 2 || x.severity === 'error') ? 'error' : 'warning',
						line,
						lineWidth,
						column,
						columnWidth,
						message,
						messageWidth,
						ruleId: x.ruleId || ''
					});
				});
		});

	let output = '\n';

	if (process.stdout.isTTY && !process.env.CI) {
		// make relative paths Cmd+click'able in iTerm
		output += ansiEscapes.iTerm.setCwd();
	}

	output += lines.map(x => {
		if (x.type === 'header') {
			// add the line number so it's Cmd+click'able in some terminals
			// use dim & gray for terminals like iTerm that doesn't support `hidden`
			const position = showLineNumbers ? chalk.hidden.dim.gray(`:${x.firstLineCol}`) : '';

			return '  ' + chalk.underline(x.relativeFilePath + position);
		}

		if (x.type === 'message') {
			const line = [
				'',
				x.severity === 'warning' ? logSymbols.warning : logSymbols.error,
				repeating(maxLineWidth - x.lineWidth) + chalk.dim(x.line + chalk.gray(':') + x.column),
				repeating(maxColumnWidth - x.columnWidth) + x.message,
				repeating(maxMessageWidth - x.messageWidth) + chalk.gray.dim(x.ruleId)
			];

			if (!showLineNumbers) {
				line.splice(2, 1);
			}

			return line.join('  ');
		}

		return '';
	}).join('\n') + '\n\n';

	if (errorCount > 0) {
		output += '  ' + chalk.red(`${errorCount}  ${plur('error', errorCount)}`) + '\n';
	}

	if (warningCount > 0) {
		output += '  ' + chalk.yellow(`${warningCount} ${plur('warning', warningCount)}`) + '\n';
	}

	return (errorCount + warningCount) > 0 ? output : '';
};
