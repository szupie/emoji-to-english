const domManipulator = (function(){

	return {
		start
	}

	function start() {
		const treeWalker = document.createTreeWalker(
			document.body, NodeFilter.SHOW_TEXT // filter to only text nodes
		);

		// perform replacement on each text node in document
		while (treeWalker.nextNode()) {
			const originalNode = treeWalker.currentNode;
			emojiReplacer.translateTextNode(originalNode);
		}
	}

}());
