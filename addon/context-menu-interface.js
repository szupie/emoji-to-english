const emojiClasses = [
	emojiReplacer.classNames['emoji'],
	emojiReplacer.classNames['translation']
];

function isEmojiComponent(node) {
	return (
		node && 
		emojiClasses.some(className => {
			return node.classList.contains(className);
		})
	);
}

document.addEventListener('mouseover', function(e) {
	if (isEmojiComponent(e.target)) {
		browser.runtime.sendMessage({
			'type': 'context-menu', 
			'content': 'show'
		});
	}
});

document.addEventListener('mouseout', function(e) {
	if (isEmojiComponent(e.target)) {
		browser.runtime.sendMessage({
			'type': 'context-menu', 
			'content': 'hide'
		});
	}
});
