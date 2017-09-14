const settingsInterface = (function(){

	function set(setting, value) {
		const styleSettings = Object.values(SettingsConstants.StyleSettings);
		if (!styleSettings.includes(setting)) {
			emojiReplacer.set(setting, value);
		} else {
			emojiStyler.set(setting, value);
		}
		return saveSettingToManager(setting, value);
	}

	function getSettingsFromManager() {
		try {
			return browser.runtime.sendMessage({
				type: SettingsConstants.REQUEST, 
				content: SettingsConstants.RequestTypes.GET
			});
		} catch(e) {
			return Promise.reject(e);
		}
	}

	function saveSettingToManager(theKey, theValue) {
		try {
			return browser.runtime.sendMessage({
				type: SettingsConstants.REQUEST, 
				content: SettingsConstants.RequestTypes.SET,
				key: theKey,
				value: theValue
			});
		} catch(e) {
			return Promise.reject(e);
		}
	}

	return {
		set,
		getSettingsFromManager,
		saveSettingToManager
	}

}());
