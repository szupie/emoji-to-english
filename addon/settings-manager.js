"use strict";

const settingsManager = (function(){

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
		const promise = browser.storage.local.get(null).then(response => {
			for (let key in response) {
				set(key, response[key]);
			}
			loadResolver();
		});

		browser.runtime.onMessage.addListener(handleMessage);

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
		if (message['type'] === "settings-request") {
			switch (message['content']) {
				case 'ready': 
					sendResponse(isReady());
					break;
				case 'get':
					sendResponse(get());
					break;
			}
		}
	}

}());

settingsManager.init();
