import process from 'node:process';
import path from 'node:path';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import plur from 'plur';
import stringWidth from 'string-width';
import ansiEscapes from 'ansi-escapes';
import {createSupportsHyperlinks} from 'supports-hyperlinks';
import getRuleDocs from 'eslint-rule-docs';

function sortResults(results) {
	return results.sort((a, b) => {
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
	});
}

function sortMessages(messages) {
	return messages.sort((a, b) => {
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
	});
}

function formatMessage(message) {
	return message.replaceAll(/\B`(.*?)`\B|\B'(.*?)'\B/g, (m, p1, p2) => chalk.bold(p1 ?? p2));
}

function getRuleUrl(ruleId, data) {
	try {
		return data.rulesMeta[ruleId].docs.url;
	} catch {
		try {
			return getRuleDocs(ruleId).url;
		} catch {
			return undefined;
		}
	}
}

function formatHeader(filePath, firstErrorOrWarning) {
	return {
		type: 'header',
		filePath,
		relativeFilePath: path.relative('.', filePath),
		firstLineCol: (firstErrorOrWarning.line && firstErrorOrWarning.column)
			? firstErrorOrWarning.line + ':' + firstErrorOrWarning.column
			: '',
	};
}

function formatOutputLine(line, options) {
	const {maxLineWidth, maxColumnWidth, maxMessageWidth, showLineNumbers, data} = options;
	if (line.type === 'header') {
		// ITerm should always use its native Command-click behavior with line:column
		// Never use file:// hyperlinks for iTerm since they can't include line:column
		if (process.env.TERM_PROGRAM === 'iTerm.app') {
			// Include hidden line:column for iTerm's Command-click
			const fileName = chalk.underline(line.relativeFilePath);
			const position = line.firstLineCol ? chalk.hidden.dim.gray(`:${line.firstLineCol}`) : '';
			return '  ' + fileName + position;
		}

		// For other terminals, use file:// hyperlinks if supported
		if (createSupportsHyperlinks(process.stdout)) {
			const fileName = chalk.underline(line.relativeFilePath);
			const encodedPath = encodeURI(line.filePath);
			const fileUrl = `file://${encodedPath}`;
			return '  ' + ansiEscapes.link(fileName, fileUrl);
		}

		// Fallback for terminals without hyperlink support
		const fileName = chalk.underline(line.relativeFilePath);
		const position = line.firstLineCol ? chalk.hidden.dim.gray(`:${line.firstLineCol}`) : '';
		return '  ' + fileName + position;
	}

	if (line.type === 'message') {
		const ruleUrl = getRuleUrl(line.ruleId, data);

		const outputLine = [
			'',
			line.severity === 'warning' ? logSymbols.warning : logSymbols.error,
			' '.repeat(maxLineWidth - line.lineWidth) + chalk.dim(line.line + chalk.gray(':') + line.column),
			' '.repeat(maxColumnWidth - line.columnWidth) + line.message,
			' '.repeat(maxMessageWidth - line.messageWidth)
			+ (ruleUrl && createSupportsHyperlinks(process.stdout) ? ansiEscapes.link(chalk.dim(line.ruleId), ruleUrl) : chalk.dim(line.ruleId)),
		];

		if (!showLineNumbers) {
			outputLine.splice(2, 1);
		}

		return outputLine.join('  ');
	}

	return '';
}

export default function eslintFormatterPretty(results, data) {
	const lines = [];
	let errorCount = 0;
	let warningCount = 0;
	let maxLineWidth = 0;
	let maxColumnWidth = 0;
	let maxMessageWidth = 0;
	let showLineNumbers = false;

	for (const result of sortResults(results)) {
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

		lines.push(formatHeader(filePath, firstErrorOrWarning));

		for (const x of sortMessages(messages)) {
			let {message} = x;

			// Stylize inline code blocks
			message = formatMessage(message);

			const line = String(x.line ?? 0);
			const column = String(x.column ?? 0);
			const lineWidth = stringWidth(line);
			const columnWidth = stringWidth(column);
			const messageWidth = stringWidth(message);

			maxLineWidth = Math.max(lineWidth, maxLineWidth);
			maxColumnWidth = Math.max(columnWidth, maxColumnWidth);
			maxMessageWidth = Math.max(messageWidth, maxMessageWidth);
			showLineNumbers ||= x.line || x.column;

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

	output += lines.map(x => formatOutputLine(x, {
		maxLineWidth,
		maxColumnWidth,
		maxMessageWidth,
		showLineNumbers,
		data,
	})).join('\n') + '\n\n';

	if (warningCount > 0) {
		output += '  ' + chalk.yellow(`${warningCount} ${plur('warning', warningCount)}`) + '\n';
	}

	if (errorCount > 0) {
		output += '  ' + chalk.red(`${errorCount} ${plur('error', errorCount)}`) + '\n';
	}

	return (errorCount + warningCount) > 0 ? output : '';
}
