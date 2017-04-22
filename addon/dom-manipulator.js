const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); // filter to only text nodes

chrome.storage.local.get(null, (res) => {
	// retrieve settings
	for (let setting in res) {
		emojiReplacer.set(setting, res[setting]);
	}

	// perform replacement on each text node in document
	while (treeWalker.nextNode()) {
		const originalNode = treeWalker.currentNode;
		emojiReplacer.translateTextNode(originalNode);
	}

	// hide emoji
	if (emojiReplacer.settings['emojiDisplay'] === 'hide') {
		document.body.setAttribute('data-emoji-to-english-hide-emojis', 1);
	}
});
