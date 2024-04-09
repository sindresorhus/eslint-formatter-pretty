import process from 'node:process';
import path from 'node:path';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import plur from 'plur';
import stringWidth from 'string-width';
import ansiEscapes from 'ansi-escapes';
import {supportsHyperlink} from 'supports-hyperlinks';
import getRuleDocs from 'eslint-rule-docs';
import terminalSize from 'terminal-size';

export default function eslintFormatterPretty(results, data) {
	const lines = [];
	let errorCount = 0;
	let warningCount = 0;
	let maxLineWidth = 0;
	let maxColumnWidth = 0;
	let maxMessageWidth = 0;
	let showLineNumbers = false;

	const termSize = terminalSize();

	for (const result of results
		.sort((a, b) => {
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
		})) {
		const {messages, filePath} = result;

		if (messages.length === 0) {
			continue;
		}

		errorCount += result.errorCount;
		warningCount += result.warningCount;

		if (lines.length > 0) {
			lines.push({type: 'separator'});
		}

		const firstErrorOrWarning = messages.find(({severity}) => severity === 2) ?? messages[0];

		lines.push({
			type: 'header',
			filePath,
			relativeFilePath: path.relative('.', filePath),
			firstLineCol: firstErrorOrWarning.line + ':' + firstErrorOrWarning.column,
		});

		for (const x of messages
			.sort((a, b) => {
				if (a.fatal === b.fatal && a.severity === b.severity) {
					if (a.line === b.line) {
						return a.column < b.column ? -1 : 1;
					}

					return a.line < b.line ? -1 : 1;
				}

				if ((a.fatal || a.severity === 2) && (!b.fatal || b.severity !== 2)) {
					return 1;
				}

				return -1;
			})) {
			let {message} = x;

			// Stylize inline code blocks
			message = message.replaceAll(/\B`(.*?)`\B|\B'(.*?)'\B/g, (m, p1, p2) => chalk.bold(p1 ?? p2));

			const line = String(x.line ?? 0);
			const column = String(x.column ?? 0);
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
				ruleId: x.ruleId ?? '',
			});
		}
	}

	let output = '\n';

	if (process.stdout.isTTY && !process.env.CI && process.env.TERM_PROGRAM === 'iTerm.app') {
		// Make relative paths Command-clickable in iTerm
		output += ansiEscapes.iTerm.setCwd();
	}

	output += lines.map(x => {
		if (x.type === 'header') {
			// Add the line number so it's Command-click'able in some terminals
			// Use dim & gray for terminals like iTerm that doesn't support `hidden`
			const position = showLineNumbers ? chalk.hidden.dim.gray(`:${x.firstLineCol}`) : '';

			return '  ' + chalk.underline(x.relativeFilePath) + position;
		}

		if (x.type === 'message') {
			let ruleUrl;

			try {
				ruleUrl = data.rulesMeta[x.ruleId].docs.url;
			} catch {
				try {
					ruleUrl = getRuleDocs(x.ruleId).url;
				} catch {}
			}

			const preLine = '';
			const severity = x.severity === 'warning' ? logSymbols.warning : logSymbols.error;
			const range = ' '.repeat(maxLineWidth - x.lineWidth) + chalk.dim(x.line + chalk.gray(':') + x.column);
			const message = ' '.repeat(maxColumnWidth - x.columnWidth) + x.message;

			const fullMessage = [preLine, severity, range, message].join('  ');

			const fullMessageWidth = 3 + stringWidth(fullMessage);
			const ruleIdWidth = stringWidth(x.ruleId);
			const totalWidth = fullMessageWidth + ruleIdWidth;

			// If fullMessageWidth is greater than the terminal width
			// then we need to ONLY use the last line of the message to determine where to place the ruleId

			let gapWidth = 0;

			// So first we check
			const totalWidthIsLessThanTerminalWidth = totalWidth < termSize.columns;

			if (totalWidthIsLessThanTerminalWidth) {
				gapWidth = termSize.columns - totalWidth;
			} else {
				// Calculate how many times the width will wrap the terminal
				const wrapTimes = Math.floor(totalWidth / termSize.columns);
				const totalLastLineWidth = totalWidth - (wrapTimes * termSize.columns);
				gapWidth = termSize.columns - totalLastLineWidth;
			}

			const rule = ruleUrl && supportsHyperlink(process.stdout)
				? ansiEscapes.link(chalk.dim(x.ruleId), ruleUrl)
				: chalk.dim(x.ruleId);

			const gap = ' '.repeat(gapWidth);

			const line = [
				preLine,
				severity,
				range,
				message,
				gap,
				rule,
			];

			if (!showLineNumbers) {
				line.splice(2, 1);
			}

			return line.join('  ');
		}

		return '';
	}).join('\n') + '\n\n';

	if (warningCount > 0) {
		output += '  ' + chalk.yellow(`${warningCount} ${plur('warning', warningCount)}`) + '\n';
	}

	if (errorCount > 0) {
		output += '  ' + chalk.red(`${errorCount} ${plur('error', errorCount)}`) + '\n';
	}

	return (errorCount + warningCount) > 0 ? output : '';
}
