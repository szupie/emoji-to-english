const domManipulator = (function(){

	const classNames = emojiReplacer.classNames;

	return {
		start,
		clean
	}

	function start(root=document.body, shouldCleanUp=true) {
		// make sure root is a node
		if (root && root.nodeType) {
			if (shouldCleanUp) {
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
	}

	function clean(root=document.body) {
		const normalizeClass = "emoji-to-english-normalize-temp";

		// remove extra nodes added by extension
		let extraNodes = root.querySelectorAll(
			`.${classNames['translation']}, .${classNames['helper']}`
		);
		for (const extraNode of extraNodes) {
			const origParent = extraNode.parentNode;
			if (origParent) {
				origParent.classList.add(normalizeClass);
				origParent.removeChild(extraNode);
			}
		}

		// restore emojis
		let emojiNodes = root.querySelectorAll(`.${classNames['emoji']}`);
		for (const emojiNode of emojiNodes) {
			const parentNode = emojiNode.parentNode;
			parentNode.classList.add(normalizeClass);
			parentNode.insertBefore(
				document.createTextNode(emojiNode.textContent),
				emojiNode
			);
			parentNode.removeChild(emojiNode);
		}

		// rejoin textNodes that were split by translated emojis
		const normalizeNodes = root.querySelectorAll(`.${normalizeClass}`);
		for (const normalizeNode of normalizeNodes) {
			normalizeNode.normalize();
			normalizeNode.classList.remove(normalizeClass);
		}

	}

}());
