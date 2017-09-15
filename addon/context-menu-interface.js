const emojiClasses = [
	emojiReplacer.classNames['emoji'],
	emojiReplacer.classNames['translation']
];

let menuShown = false;

function showMenu(shouldShow) {
	const content = shouldShow ? 'show' : 'hide';
	menuShown = shouldShow;
	browser.runtime.sendMessage({
		'type': 'context-menu', 
		'content': content
	});
}

function isEmojiComponent(node) {
	return (
		node && 
		emojiClasses.some(className => {
			return node.classList.contains(className);
		})
	);
}

function hasTextContent(node) {
	return (
		node &&
		[...node.childNodes].some(childNode => {
			const isTextNode = childNode.nodeType === Node.TEXT_NODE;
			const isNonEmpty = childNode.textContent.trim();
			return isTextNode && isNonEmpty;
		})
	);
}

document.addEventListener('mouseover', function(e) {
	if ((isEmojiComponent(e.target) || hasTextContent(e.target)) && !menuShown) {
		showMenu(true);
	}
});

document.addEventListener('mouseout', function(e) {
	if ((isEmojiComponent(e.target) || hasTextContent(e.target)) && menuShown) {
		showMenu(false);
	}
});

function handleMessage(message) {
	if (message['type'] === 'context-menu-set-setting') {
		const setting = message['content']['key'];
		const value = message['content']['value'];
		settingsInterface.set(setting, value);
		domManipulator.start();
	} else if (message['type'] === 'context-menu-action') {
		if (message['content'] === 'reload') {
			domManipulator.start();
		}
	}
}

browser.runtime.onMessage.addListener(handleMessage);
