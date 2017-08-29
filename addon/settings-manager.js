"use strict";

const settingsManager = (function(){

	const SETTINGS_REQUEST = SettingsConstants.REQUEST;
	const RequestTypes = SettingsConstants.RequestTypes;

	const Keys = SettingsConstants.Keys;
	const Values = SettingsConstants.Values;

	const items = {};
	const settings = {};

	let loadResolver;
	const settingsLoaded = new Promise(resolve => {
		loadResolver = resolve;
	});

	return {
		init,
		get,
		set,
		setAll,
		clean
	}

	function init() {
		// load user settings
		const promise = browser.storage.local.get(null).then(response => {
			const initSettings = {};
			Object.assign(initSettings, getDefaults(), response);
			setAll(initSettings);
			loadResolver(); // settings loaded; resolve promise
		}, failure => { console.trace(failure); });
		browser.runtime.onMessage.addListener(handleMessage);

		// handle updates
		browser.runtime.onInstalled.addListener(handleInstalled);

		return promise;
	}

	async function get(key) {
		await isReady();
		return key ? settings[key] : settings;
	}

	function set(key, value) {
		settings[key] = value;
		return browser.storage.local.set({
			[key]: value
		});
	}

	function setAll(dict) {
		for (let key in dict) {
			set(key, dict[key]);
		}
	}

	function clean() {
		// clear settings in memory
		Object.getOwnPropertyNames(settings).forEach(key => {
			if (!Object.values(Keys).includes(key)) {
				delete settings[key];
			}
		});
		browser.storage.local.clear(); // clear settings in storage
	}

	function getDefaults() {
		const defaults = {};
		defaults[Keys.DISPLAY_MODE] = Values.DisplayModes.INLINE;
		defaults[Keys.WRAPPER_START] = '[:';
		defaults[Keys.WRAPPER_END] = ':]';
		//defaults[Keys.IGNORE_LIST] = '';
		defaults[Keys.SHOW_EMOJI] = true;

		return defaults;
	}

	function isReady() {
		return Promise.race([settingsLoaded]);
	}

	function handleMessage(message, sender, sendResponse) {
		if (message.type === SETTINGS_REQUEST) {
			switch (message.content) {
				case RequestTypes.WAIT_FOR_LOAD: 
					sendResponse(isReady());
					break;
				case RequestTypes.GET:
					sendResponse(get());
					break;
				case RequestTypes.SET:
					set(message.key, message.value);
					sendResponse(true);
					break;
			}
		}
	}

	async function handleInstalled(details) {
		if (details.reason === 'update') {
			//console.log(details.previousVersion);
			if (Number.parseFloat(details.previousVersion) < 3) {
				await isReady();
				settingsMigrator.migrate(settingsMigrator.Schemas.PRE3);
			}
		}
	}

}());

settingsManager.init();
