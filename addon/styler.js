const styleNode = document.createElement('style');
document.head.appendChild(styleNode);
const stylesheet = styleNode.sheet;

const emojiStyler = (function() {

	const SETTINGS_REQUEST = SettingsConstants.REQUEST;
	const RequestTypes = SettingsConstants.RequestTypes;

	const Keys = SettingsConstants.Keys;
	const Values = SettingsConstants.Values;

	const selectors = {
		translation: 'samp.emoji-to-english-translation',
		emoji: '.emoji-to-english-translatable'
	};

	return {
		init,
		selectors,
		set,
	}

	function init() {
		return requestSettings().then(response => {
			for (let key in SettingsConstants.StyleSettings) {
				set(Keys[key], response[Keys[key]]);
			}
		});
	}

	function set(key, value) {
		if (key === Keys.SHOW_EMOJI) {
			document.body.setAttribute('data-emoji-to-english-hide-emojis', !value*1);
		}
	}

	function addRule(selector, declaration) {
		stylesheet.insertRule(
			`${selector} {
				${declaration}
			}`, 
			stylesheet.cssRules.length
		);
		console.log(stylesheet.cssRules);
	}

	function requestSettings() {
		return browser.runtime.sendMessage({
			type: SETTINGS_REQUEST, 
			content: RequestTypes.GET
		});
	}
}());
