"use strict";

const settingsMigrator = (function(){

	const SettingsGroup = SettingsConstants.Group;
	const Translation = SettingsConstants.Translation;

	const Keys = SettingsConstants.Keys;
	const Values = SettingsConstants.Values;

	const Schemas = {
		PRE3: 'pre3'
	};

	return {
		migrate,
		Schemas
	}

	async function migrate(version) {
		let newSettings;
		switch (version) {
			case Schemas.PRE3:
				newSettings = await migrateFromPre3();
				break;
		}
		console.log('new settings:');
		console.log(newSettings);
		// browser.storage.local.clear();
		// settingsManager.set(newSettings);
	}

	function migrateFromPre3() {
		const pre3Wrappers = {
			'parentheses': ['(', ')'],
			'squarebrackets': ['[', ']'],
			'colons': [':', ':'],
		}
		return settingsManager.get().then(settings => {
			const translationSettings = {};
			const styleSettings = {};
			let updated = {};

			if (settings['showTranslation'] === true) {
				updated[Keys.DISPLAY_MODE] = Values.DisplayModes.INLINE;
			} else {
				updated[Keys.DISPLAY_MODE] = Values.DisplayModes.NONE;
			}

			switch (settings['emojiDisplay']) {
				case 'emoji':
					updated[Keys.SHOW_EMOJI] = true;
					break;
				case 'tooltip':
					updated[Keys.SHOW_EMOJI] = true;
					updated[Keys.DISPLAY_MODE] = Values.DisplayModes.TOOLTIP;
					break;
				case 'hide':
					updated[Keys.SHOW_EMOJI] = false;
					break;
			}

			if (settings['wrapper'] !== 'custom') {
				const rawWrappers = pre3Wrappers[settings['wrapper']];
				updated[Keys.WRAPPER_START] = rawWrappers[0];
				updated[Keys.WRAPPER_END] = rawWrappers[1];
			} else {
				updated[Keys.WRAPPER_START] = settings['wrapStart'];
				updated[Keys.WRAPPER_END] = settings['wrapEnd'];
			}

			if (settings['ignoreFlags']) {
				// TODO: add flags to ignore list
			}

			return updated;
		});
	}

}());