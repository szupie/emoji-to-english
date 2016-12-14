const emojiReplacer = (function(){

	const wrappers = {
		'parentheses': ['(', ')'],
		'squarebrackets': ['[', ']'],
		'colons': [':', ':'],
	}

	const settings = {};

	settings.showEmoji = true;
	settings.wrapper = 'parentheses';
	settings.wrapStart = '';
	settings.wrapEnd = '';
	settings.ignoreFlags = true;

	const pattern = buildPattern();
	const template = document.createElement('template');

	return {
		settings,
		set,
		pattern,
		translateTextNode: buildTranslatedNodes
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
			if (settings.nameInMouseover) {
				translation = `<span title="${nameWithDelimiter(name)}">${match}</span>`
			} else {
				translation = match;
			}
		}
		if (settings.nameAfterEmoji) {
			translation += nameWithDelimiter(name);
		}
		return translation;
	}
	
	function nameWithDelimiter(namegoeshere) {
		let result = '';
		if (settings.wrapper !== 'nothing') {
			if (settings.wrapper === 'custom') {
				result += [settings.wrapStart, settings.wrapEnd].join(namegoeshere);
			} else {
				result += wrappers[settings.wrapper].join(namegoeshere);
			}
		} else {
			result += namegoeshere;
		}
		return result;
	}

	// returns list of translated emojis and list of surrounding texts
	// if no emojis are found, returns false
	function getReplacedParts(original) {
		if (pattern.test(original)) {
			const splits = original.split(pattern);
			const translations = original.match(pattern).map(string => replaceMatch(string));
			return {splits, translations};
		}
		return false;
	}

	function buildTranslatedNodes(originalNode) {
		const originalText = originalNode.nodeValue;
		const parent = originalNode.parentElement;
		
		// do not replace script contents
		if (!parent || parent.tagName.toLowerCase() !== 'script') {

			// splice together translations and surrounding text
			const {splits, translations} = getReplacedParts(originalText);
			if (splits) {
				const parts = splits.map(string => document.createTextNode(string));
				parts.forEach((node, index) => {
					// insert nodes for non-matched/surrounding text from original
					parent.insertBefore(node, originalNode);

					// insert nodes for translated matches
					if (index < parts.length-1) {
						// use `innerHTML` to support formatted html code
						template.innerHTML = translations[index];
						parent.insertBefore(template.content, originalNode);
					}
				});
				// clear original text node
				originalNode.nodeValue = "";
			}

		}
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