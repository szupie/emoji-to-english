const emojiReplacer = (function(){

	const SETTINGS_REQUEST = SettingsConstants.REQUEST;
	const RequestTypes = SettingsConstants.RequestTypes;

	const classNames = {
		'emoji': 'emoji-to-english-translatable',
		'translation': 'emoji-to-english-translation'
	};

	const Keys = SettingsConstants.Keys;
	const Values = SettingsConstants.Values;

	let flattenedDictionary = {};
	let settings;
	let pattern;
	let ignorePattern;

	return {
		init,
		settings,
		set,
		classNames,
		translateTextNode: buildTranslatedNodes
	}

	function init() {
		flattenedDictionary = flatten(namesDictionary);
		return requestSettings().then(response => {
			settings = response;
			pattern = getEmojiMatchPattern();
			rebuildIgnorePattern();
		}, failure => { console.trace(failure); });
	}

	function getEmojiMatchPattern() {
		const emojis = Object.keys(flattenedDictionary);
		// sort by longest first to grep longest match
		emojis.sort((a,b) => {
			return b.length - a.length;
		});

		const escapedEmojis = emojis.map(emoji => escapeForRegex(emoji));
		return new RegExp(escapedEmojis.join('|'), 'ug');
	}

	function rebuildIgnorePattern() {
		const ignorePatterns = []; // matches nothing initially
		if (settings[Keys.IGNORE_LIST]) {
			settings[Keys.IGNORE_LIST].forEach(setAlias => {
				const setMatches = {};
				const matchedGroup = flatten(namesDictionary[setAlias]);
				const matchedSubgroup = flatten(namesDictionary)[setAlias];
				Object.assign(setMatches, matchedGroup, matchedSubgroup);

				ignorePatterns.push(...Object.keys(setMatches));
			});
		}
		const escapedPatterns = ignorePatterns.map(str => escapeForRegex(str));
		if (escapedPatterns.length <= 0) {
			escapedPatterns.push('.^');
		} 

		ignorePattern = new RegExp(escapedPatterns.join('|'), 'u');
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

	function generateLocalisationWithModifier(sequence) {
		const modifierPattern = /[\u{1F3FB}-\u{1F3FF}]/u;
		const modifierIndex = sequence.search(modifierPattern);

		if (modifierIndex >= 0) {
			const base = sequence.replace(modifierPattern, '');
			const modifier = modifierPattern.exec(sequence)[0];

			const translatedBase = getAndVerifyMessage(trimVS(base));
			const translatedModifier = getAndVerifyMessage(modifier);

			if (!isUndefined(translatedBase) &&
				!isUndefined(translatedModifier)) {
				return `${translatedBase}: ${translatedModifier}`;
			}
		}
	}

	function getLocalisedNameForEmoji(emoji) {
		let translation = getAndVerifyMessage(emoji);

		if (isUndefined(translation)) {
			// try trimming variation selectors
			translation = getAndVerifyMessage(trimVS(emoji));
		}

		if (isUndefined(translation)) {
			// try translating modifier and base separately
			translation = generateLocalisationWithModifier(trimVS(emoji));
		}

		if (isUndefined(translation)) {
			// fall back to non-localised name
			translation = flattenedDictionary[emoji];
		}

		return translation;
	}

	function getTranslationForEmoji(emoji) {
		const name = getLocalisedNameForEmoji(emoji);
		
		const userWrappers = [
			settings[Keys.WRAPPER_START], 
			settings[Keys.WRAPPER_END]
		];
		return `${userWrappers[0]}${name}${userWrappers[1]}`;
	}

	// returns list of translated emojis and list of surrounding texts
	// if no emojis are found, returns false
	function getReplacedParts(original) {
		if (pattern.test(original)) {
			const emojis = original.match(pattern);
			const nonemojis = original.split(pattern);

			// pad end of emojis and translations with empty array item
			// because original text will be rebuilt in sections,
			// each ending with (potentially empty) emoji/translations pair
			const translations = emojis.map(
				emoji => getTranslationForEmoji(emoji)
			).concat('');
			const replaceEmojis = emojis.map(emoji => emoji).concat('');
			
			// if this is true, something went wrong
			if (nonemojis.length !== replaceEmojis.length || 
				replaceEmojis.length !== translations.length) {
				console.warn(
					'Programmer error: unexpected split length.', 
					nonemojis, 
					emojis, 
					translations
				);
			}

			return nonemojis.map((nonemoji, index) => {
				const replacedParts = {
					nonemoji: nonemoji,
					emoji: replaceEmojis[index],
					translation: translations[index]
				};

				// treat ignored strings as nonemojis
				if (ignorePattern.test(emojis[index])) {
					replacedParts['nonemoji'] = nonemoji.concat(emojis[index]);
					replacedParts['emoji'] = '';
					replacedParts['translation'] = '';
				}

				// suppress translation after emoji
				if (settings[Keys.DISPLAY_MODE] === Values.DisplayModes.NONE) {
					replacedParts['translation'] = '';
				}

				return replacedParts;
			});
		}
		return false;
	}

	function getReplacedEmojiNode(emoji, translation) {
		const emojiNode = document.createElement('span');
		emojiNode.classList.add(classNames['emoji']);
		emojiNode.appendChild(document.createTextNode(emoji));

		// show translation on hover
		if (settings[Keys.DISPLAY_MODE] === Values.DisplayModes.TOOLTIP) {
			emojiNode.setAttribute('title', translation);
		}

		return emojiNode;
	}

	function buildTranslatedNodes(originalNode) {
		const originalText = originalNode.nodeValue;
		const parentNode = originalNode.parentElement;
		const ZEROWIDTHJOINER = '\u200D';
		
		// do not replace script contents
		if (!parentNode || parentNode.tagName.toLowerCase() !== 'script') {

			// splice together translations and surrounding text
			const replacementDictionary = getReplacedParts(originalText);

			if (replacementDictionary) {

				// text node may be segmented by multiple emojis;
				// build original + emoji + translation by segment
				let index = 0;
				while (index < replacementDictionary.length) {
					let {
						nonemoji, 
						emoji, 
						translation
					} = replacementDictionary[index];

					// for legibility, group consecutive emojis together
					// and display translation afterwards;
					// concatenate sections until a nonemoji is encountered
					while (++index < replacementDictionary.length) {
						// look ahead for empty sections in 
						// the original text, segmented by emojis
						const nextSection = replacementDictionary[index];

						const nonemojiIsEmpty = nextSection['nonemoji'] === '';
						const nonemojiIsZeroWidthJoiner = 
							nextSection['nonemoji'] === ZEROWIDTHJOINER;

						if (nonemojiIsEmpty || nonemojiIsZeroWidthJoiner) {
							// add ZERO WIDTH JOINER back into emoji 
							// to display joined emojis properly
							if (nonemojiIsZeroWidthJoiner) {
								emoji = emoji.concat(ZEROWIDTHJOINER);
							}

							nonemoji = nonemoji.concat(
								nextSection['nonemoji']
							);

							emoji = emoji.concat(nextSection['emoji']);

							translation = translation.concat(
								nextSection['translation']
							);

						} else {
							break;
						}
					}

					const nonemojiNode = document.createTextNode(nonemoji);

					const emojiNode = getReplacedEmojiNode(emoji, translation);

					const translationNode = document.createElement('samp');
					translationNode.classList.add(classNames['translation']);
					translationNode.appendChild(
						document.createTextNode(translation)
					);

					parentNode.insertBefore(nonemojiNode, originalNode);
					parentNode.insertBefore(emojiNode, originalNode);
					parentNode.insertBefore(translationNode, originalNode);

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
		if (setting === Keys.IGNORE_LIST) {
			rebuildIgnorePattern();
		}
	}

	function flatten(dict) {
		while (!isFlat(dict)) {
			dict = collapseObject(dict);
		}
		return dict;
	}

	function collapseObject(nestedObj) {
		const collapsedObj = {};
		if (nestedObj) {
			Object.assign(collapsedObj, ...Object.values(nestedObj)); 
		}
		return collapsedObj;
	}

	function isFlat(object) {
		return (typeof Object.values(object)[0] !== 'object');
	}

	function requestSettings() {
		return browser.runtime.sendMessage({
			type: SETTINGS_REQUEST, 
			content: RequestTypes.GET
		});
	}

}());
