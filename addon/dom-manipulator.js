const domManipulator = (function(){

	return {
		start
	}

	function start() {
		clean();

		const treeWalker = document.createTreeWalker(
			document.body, NodeFilter.SHOW_TEXT // filter to only text nodes
		);

		// perform replacement on each text node in document
		while (treeWalker.nextNode()) {
			const originalNode = treeWalker.currentNode;
			emojiReplacer.translateTextNode(originalNode);
		}
	}

	function clean() {
		// remove annotations added by extension
		let translationNodes = 
			document.getElementsByClassName('emoji-to-english-translation');
		while (translationNodes[0]) {
			translationNodes[0].parentNode.removeChild(translationNodes[0]);
		}

		// restore emojis
		let emojiNodes = 
			document.querySelectorAll('.emoji-to-english-translatable');
		for (const emojiNode of emojiNodes) {
			emojiNode.parentNode.insertBefore(
				document.createTextNode(emojiNode.textContent),
				emojiNode
			);
			emojiNode.parentNode.removeChild(emojiNode);
		}
	}

}());
