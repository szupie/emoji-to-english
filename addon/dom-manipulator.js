const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

chrome.storage.local.get(null, (res) => {
	for (let setting in res) {
		emojiReplacer.set(setting, res[setting]);
	}
	while (treeWalker.nextNode()) {
		const original = treeWalker.currentNode.nodeValue;
		treeWalker.currentNode.nodeValue = original.replace(emojiReplacer.pattern, emojiReplacer.replaceMatch);
	}
});