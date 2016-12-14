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

	function getTranslationForMatch(match) {
		const codePoint = match.codePointAt();
		const name = namesDictionary['names'][codePoint];

		let translation = name;
		if (settings.wrapper !== 'nothing') {
			if (settings.wrapper === 'custom') {
				translation = [settings.wrapStart, settings.wrapEnd].join(translation);
			} else {
				translation = wrappers[settings.wrapper].join(translation);
			}
		}
		return translation;
	}

	// returns list of translated emojis and list of surrounding texts
	// if no emojis are found, returns false
	function getReplacedParts(original) {
		if (pattern.test(original)) {
			const nonemojis = original.split(pattern);
			let emojis = original.match(pattern);
			const translations = emojis.map(string => getTranslationForMatch(string)).concat('');
			
			// pad end of emojis and translations because split length should always be emojis length + 1
			emojis.push('');
			if (nonemojis.length !== emojis.length || emojis.length !== translations.length) {
				console.warn('Programmer error: assumption of split length is incorrect.', nonemojis, emojis, translations);
			}

			return nonemojis.map((nonemoji, index) => {
				// treat regional indicators as nonemojis depending on settings
				if (settings.ignoreFlags && /[\u{1F1E6}-\u{1F1FF}]/u.test(emojis[index])) {
					return {
						nonemoji: nonemoji.concat(emojis[index]),
						emoji: '',
						translation: ''
					}
				} else {
					return {
						nonemoji: nonemoji,
						emoji: emojis[index],
						translation: translations[index]
					}
				}
			});
		}
		return false;
	}

	function buildTranslatedNodes(originalNode) {
		const originalText = originalNode.nodeValue;
		const parent = originalNode.parentElement;
		const zeroWidthJoiner = '\u200D';
		
		// do not replace script contents
		if (!parent || parent.tagName.toLowerCase() !== 'script') {

			// splice together translations and surrounding text
			const replacementDictionary = getReplacedParts(originalText);

			if (replacementDictionary) {
				let index = 0;
				while (index < replacementDictionary.length) {
					let {nonemoji, emoji, translation} = replacementDictionary[index];

					// collapse consecutive emoji matches in array
					while (++index < replacementDictionary.length) {
						const nextSection = replacementDictionary[index];

						const nonemojiIsEmpty = nextSection['nonemoji'] === '';
						const nonemojiIsZeroWidthJoiner = nextSection['nonemoji'] === zeroWidthJoiner;

						if (nonemojiIsEmpty || nonemojiIsZeroWidthJoiner) {
							// add ZERO WIDTH JOINER back into emoji to display joined emojis properly
							if (nonemojiIsZeroWidthJoiner) {
								emoji = emoji.concat(zeroWidthJoiner);
							}

							nonemoji = nonemoji.concat(nextSection['nonemoji']);
							emoji = emoji.concat(nextSection['emoji']);
							translation = translation.concat(nextSection['translation']);

						} else {
							break;
						}
					}

					// insert nodes for non-matched/surrounding text from original
					const node = document.createTextNode(nonemoji);
					parent.insertBefore(node, originalNode);

					// insert nodes for translated emojis

					// use `innerHTML` to support formatted html code
					if (settings.showEmoji) {
						template.innerHTML = `${emoji}${translation}`;
					} else {
						template.innerHTML = translation;
					}

					parent.insertBefore(template.content, originalNode);
				}
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