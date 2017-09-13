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

document.addEventListener('mouseover', function(e) {
	if (isEmojiComponent(e.target) && !menuShown) {
		showMenu(true);
	}
});

document.addEventListener('mouseout', function(e) {
	if (isEmojiComponent(e.target) && menuShown) {
		showMenu(false);
	}
});

function handleMessage(message) {
	if (message['type'] === "context-menu-set-setting") {
		const setting = message['content']['key'];
		const value = message['content']['value'];
		settingsInterface.set(setting, value);
	}
}

browser.runtime.onMessage.addListener(handleMessage);
