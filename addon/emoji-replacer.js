const emojiReplacer = (function(){

	const wrappers = {
		'parentheses': ['(', ')'],
		'squarebrackets': ['[', ']'],
		'colons': [':', ':'],
	}

	const settings = {};

	settings.emojiDisplay = 'emoji';
	settings.showTranslation = true;
	settings.wrapper = 'parentheses';
	settings.wrapStart = '';
	settings.wrapEnd = '';
	settings.ignoreFlags = true;

	const pattern = buildPattern();
	const template = document.createElement('template');

	return {
		settings,
		set,
		translateTextNode: buildTranslatedNodes
	}

	function buildPattern() {
		const emojis = Object.keys(namesDictionary);
		// sort by longest first to grep longest match
		emojis.sort((a,b) => {
			return b.length - a.length;
		});

		const escapedEmojis = emojis.map(emoji => escapeForRegex(emoji));
		return new RegExp(escapedEmojis.join('|'), 'ug');
	}

	function getReplacedEmoji(emoji, translation) {
		let replacement = emoji;
		switch (settings.emojiDisplay) {
			case 'hide':
				replacement = '';
				break;
			case 'tooltip':
				replacement = `<span title="${translation}">${emoji}</span>`;
				break;
		}
		return replacement;
	}

	function getAndVerifyMessage(message) {
		try {
			const localisation = browser.i18n.getMessage(message);
			if (localisation.length <= 0) {
				return;
			}
			return localisation;
		} catch(e) {
			return;
		}
	}

	function getLocalisedNameForEmoji(emoji) {
		let translation = getAndVerifyMessage(emoji);

		if (isUndefined(translation)) {
			// try trimming variation selectors
			translation = getAndVerifyMessage(trimVS(emoji));
		}

		if (isUndefined(translation)) {
			// fall back to non-localised name
			translation = namesDictionary[emoji];
		}

		return translation;
	}

	function getTranslationForEmoji(emoji) {
		const name = getLocalisedNameForEmoji(emoji);
		
		let userWrappers = ['', ''];
		if (settings.wrapper !== 'nothing') {
			userWrappers = wrappers[settings.wrapper];
			if (settings.wrapper === 'custom') {
				userWrappers = [settings.wrapStart, settings.wrapEnd];
			}
		}
		return `${userWrappers[0]}${name}${userWrappers[1]}`;
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
				if (!settings.showTranslation) {
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

	function escapeForRegex(sequence) {
		return sequence.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	// trim variation selectors surrounding sequence
	function trimVS(sequence) {
		const split = sequence.split(/^[\uFE00-\uFE0F]+|[\uFE00-\uFE0F]+$/);
		return split.filter(sequence => sequence.length>0)[0];
	}

	function isUndefined(variable) {
		return (typeof variable === 'undefined');
	}

	function set(setting, value) {
		settings[setting] = value;
	}
}());
