"use strict";

const settingsManager = (function(){

	const SETTINGS_REQUEST = SettingsConstants.REQUEST;
	const RequestTypes = SettingsConstants.RequestTypes;

	const Keys = SettingsConstants.Keys;
	const Values = SettingsConstants.Values;

	const items = {};

	items.emojiDisplay = 'emoji';
	items.showTranslation = true;
	items.wrapper = 'parentheses';
	items.wrapStart = '';
	items.wrapEnd = '';
	items.ignoreFlags = true;

	let loadResolver;
	const settingsLoaded = new Promise(resolve => {
		loadResolver = resolve;
	});

	return {
		init,
		get,
		set
	}

	function init() {
		// load user settings
		const promise = browser.storage.local.get(null).then(response => {
			for (let key in response) {
				set(key, response[key]);
				console.log(key, response[key]);
			}
			loadResolver(); // settings loaded; resolve promise
		}, failure => { console.trace(failure); });

		browser.runtime.onMessage.addListener(handleMessage);

		// handle updates
		browser.runtime.onInstalled.addListener(handleInstalled);

		return promise;
	}

	async function get(key) {
		await isReady();
		return key ? items[key] : items;
	}

	function set(key, value) {
		items[key] = value;
		return browser.storage.local.set({
			[key]: value
		});
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
					// TODO: set
					break;
			}
		}
	}

	function handleInstalled(details) {
		if (details.reason === 'update') {
			console.log(details.previousVersion);
			if (Number.parseFloat(details.previousVersion) < 3) {
				settingsMigrator.migrate(settingsMigrator.Schemas.PRE3);
			}
		}
	}

}());

settingsManager.init();
