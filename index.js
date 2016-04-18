'use strict';
var path = require('path');
var chalk = require('chalk');
var table = require('text-table');
var logSymbols = require('log-symbols');
var plur = require('plur');
var stringWidth = require('string-width');
var ansiEscapes = require('ansi-escapes');

module.exports = function (results) {
	var output = '\n';
	var errorCount = 0;
	var warningCount = 0;

	// make relative paths Cmd+click'able in iTerm
	output += ansiEscapes.iTerm.setCwd();

	results.forEach(function (result) {
		var messages = result.messages;

		if (messages.length === 0) {
			return;
		}

		errorCount += result.errorCount;
		warningCount += result.warningCount;

		var relFp = path.relative('.', result.filePath);
		// add the line number so it's Cmd+click'able in some terminals
		// use dim & gray for terminals like iTerm that doesn't support `hidden`
		var lineNum = chalk.hidden.dim.gray(':' + result.messages[0].line);
		output += '  ' + chalk.underline(relFp + lineNum) + '\n';

		output += table(
			messages.map(function (x) {
				var type = (x.fatal || x.severity === 2) ? logSymbols.error : logSymbols.warning;
				var msg = x.message;

				// stylize inline code blocks
				msg = msg.replace(/`(.*?)`/g, function (m) {
					return chalk.bold(m.slice(1, -1));
				});

				return [
					'',
					type,
					x.line || 0,
					x.column || 0,
					msg,
					chalk.dim(x.ruleId || '')
				];
			}),
			{
				align: [
					'',
					'l',
					'r',
					'l',
					'l',
					'l'
				],
				stringLength: stringWidth
			}
		).split('\n').map(function (el) {
			return el.replace(/(\d+)\s+(\d+)/, function (m, p1, p2) {
				return chalk.dim(p1 + chalk.gray(':') + p2);
			});
		}).join('\n') + '\n\n';
	});

	if (errorCount > 0) {
		output += '  ' + chalk.red(errorCount + ' ' + plur('error', errorCount)) + '\n';
	}

	if (warningCount > 0) {
		output += '  ' + chalk.yellow(warningCount + ' ' + plur('warning', warningCount)) + '\n';
	}

	return (errorCount + warningCount) > 0 ? output : '';
};
