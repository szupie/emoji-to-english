chrome.storage.local.get(null, (res) => {
	// retrieve settings
	for (let setting in res) {
		emojiReplacer.set(setting, res[setting]);
	}

	domManipulator.start();
	
	// hide emoji
	if (emojiReplacer.settings['emojiDisplay'] === 'hide') {
		document.body.setAttribute('data-emoji-to-english-hide-emojis', 1);
	}

});
