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

	function getReplacedEmoji(emoji, translation) {
		let replacement = '';
		if (settings.showEmoji) {
			replacement = emoji;
			if (settings.nameInMouseover) {
				replacement = `<span title="${translation}">${replacement}</span>`
			}
		}
		return replacement;
	}

	function getTranslationForEmoji(emoji) {
		const codePoint = emoji.codePointAt();
		const name = namesDictionary['names'][codePoint];

		let wrappers = ['', ''];
		if (settings.wrapper !== 'nothing') {
			wrappers = wrappers[settings.wrapper];
			if (settings.wrapper === 'custom') {
				wrappers = [settings.wrapStart, settings.wrapEnd];
			}
		}
		return `${wrappers[0]}${name}${wrappers[1]}`;
	}

	// returns list of translated emojis and list of surrounding texts
	// if no emojis are found, returns false
	function getReplacedParts(original) {
		if (pattern.test(original)) {
			const emojis = original.match(pattern);
			const nonemojis = original.split(pattern);

			// pad end of emojis and translations because split length should always be emojis length + 1
			const translations = emojis.map(emoji => getTranslationForEmoji(emoji)).concat('');
			const replaceEmojis = emojis.map((emoji, index) => getReplacedEmoji(emoji, translations[index])).concat('');
			
			if (nonemojis.length !== replaceEmojis.length || replaceEmojis.length !== translations.length) {
				console.warn('Programmer error: assumption of split length is incorrect.', nonemojis, emojis, translations);
			}

			return nonemojis.map((nonemoji, index) => {
				const replacedParts = {
					nonemoji: nonemoji,
					emoji: replaceEmojis[index],
					translation: translations[index]
				};

				// treat regional indicators as nonemojis
				if (settings.ignoreFlags && /[\u{1F1E6}-\u{1F1FF}]/u.test(emojis[index])) {
					replacedParts['nonemoji'] = nonemoji.concat(emojis[index]);
					replacedParts['emoji'] = '';
					replacedParts['translation'] = '';
				}

				// suppress translation after emoji
				if (!settings.nameAfterEmoji) {
					replacedParts['translation'] = '';
				}

				return replacedParts;
			});
		}
		return false;
	}

	function buildTranslatedNodes(originalNode) {
		const originalText = originalNode.nodeValue;
		const parent = originalNode.parentElement;
		const ZEROWIDTHJOINER = '\u200D';
		
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
						// look ahead for empty sections in the original splitted by emojis
						const nextSection = replacementDictionary[index];

						const nonemojiIsEmpty = nextSection['nonemoji'] === '';
						const nonemojiIsZeroWidthJoiner = nextSection['nonemoji'] === ZEROWIDTHJOINER;

						if (nonemojiIsEmpty || nonemojiIsZeroWidthJoiner) {
							// add ZERO WIDTH JOINER back into emoji to display joined emojis properly
							if (nonemojiIsZeroWidthJoiner) {
								emoji = emoji.concat(ZEROWIDTHJOINER);
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
					template.innerHTML = `${emoji}${translation}`;

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