const settingsInterface = (function(){

	function set(setting, value) {
		if (!(setting in SettingsConstants.StyleSettings)) {
			emojiReplacer.set(setting, value);
		} else {
			emojiStyler.set(setting, value);
		}
		return saveSettingToManager(setting, value);
	}

	function getSettingsFromManager() {
		return browser.runtime.sendMessage({
			type: SettingsConstants.REQUEST, 
			content: SettingsConstants.RequestTypes.GET
		});
	}

	function saveSettingToManager(theKey, theValue) {
		return browser.runtime.sendMessage({
			type: SettingsConstants.REQUEST, 
			content: SettingsConstants.RequestTypes.SET,
			key: theKey,
			value: theValue
		});
	}

	return {
		set,
		getSettingsFromManager,
		saveSettingToManager
	}

}());
