const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

chrome.storage.local.get(null, (res) => {
	for (let setting in res) {
		emojiReplacer.set(setting, res[setting]);
	}
	document.body.innerHTML = document.body.innerHTML.replace(emojiReplacer.pattern, emojiReplacer.replaceMatch);
});