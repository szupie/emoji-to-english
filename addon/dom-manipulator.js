const domManipulator = (function(){

	const classNames = emojiReplacer.classNames;

	return {
		start,
		clean
	}

	function start(root=document.body, cleanUp=true) {
		if (cleanUp) {
			clean(root);
		}

		const treeWalker = document.createTreeWalker(
			root, NodeFilter.SHOW_TEXT // filter to only text nodes
		);

		// perform replacement on each text node in document
		while (treeWalker.nextNode()) {
			const originalNode = treeWalker.currentNode;
			emojiReplacer.translateTextNode(originalNode);
		}
	}

	function clean(root=document.body) {
		// remove extra nodes added by extension
		let extraNodes = root.querySelectorAll(
			`.${classNames['translation']}, .${classNames['helper']}`
		);
		for (const extraNode of extraNodes) {
			extraNode.parentNode.removeChild(extraNode);
		}

		// restore emojis
		let emojiNodes = root.querySelectorAll(`.${classNames['emoji']}`);
		for (const emojiNode of emojiNodes) {
			emojiNode.parentNode.insertBefore(
				document.createTextNode(emojiNode.textContent),
				emojiNode
			);
			emojiNode.parentNode.removeChild(emojiNode);
		}
	}

}());
