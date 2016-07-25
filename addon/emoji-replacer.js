const emojiReplacer = (function(){

	const wrappers = {
		'parentheses': ['(', ')'],
		'squarebrackets': ['[', ']'],
		'colons': [':', ':'],
	}

	const settings = {};

	settings.showEmoji = true;
	settings.wrapper = 'parentheses';
	settings.ignoreFlags = true;

	const pattern = buildPattern();

	return {
		settings,
		set,
		pattern: pattern,
		replaceMatch: replaceMatch
	}

	function buildPattern() {
		const pattern = [];

		namesDictionary['ranges'].forEach(range => {
			if (typeof range === 'number') {
				const paddedCodePoint = toPaddedHex(range);
				pattern.push(wrapMatch(escapeUnicode(paddedCodePoint)));
			} else if (Array.isArray(range)) {
				const escapedRange = range.map(value => escapeUnicode(toPaddedHex(value)));
				pattern.push(wrapMatch(`[${escapedRange[0]}-${escapedRange[1]}]`))
			}
		});

		return new RegExp(pattern.join('|'), 'ug');
	}

	function replaceMatch(match) {
		const codePoint = match.codePointAt();
		const name = namesDictionary['names'][codePoint];
		let translation = '';
		if (settings.ignoreFlags && /[\u{1F1E6}-\u{1F1FF}]/u.test(match)) {
			return match;
		}
		if (settings.showEmoji) {
			translation += match;
		}
		if (settings.wrapper !== 'nothing') {
			translation += wrappers[settings.wrapper].join(name);
		} else {
			translation += name;
		}
		return translation;
	}

	function toPaddedHex(number) {
		return (`000000${number.toString(16)}`).slice(-6);
	}

	function wrapMatch(inside) {
		return `(?:${inside})`;
	}

	function escapeUnicode(codePoint) {
		return `\\u{${codePoint}}`;
	}

	function set(setting, value) {
		settings[setting] = value;
	}
}());