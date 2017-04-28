const menuItems = [
	{
		id: 'context-parent',
		title: 'Emoji Settings',
		contexts: ['link', 'page'],
	}, {
	// These should be radio items, but unlike checkboxes, radios do not work
	// if they are removed while the context menu is visible
		id: 'context-translation-inline',
		type: 'checkbox', 
		parentId: 'context-parent',
		title: 'Always Show Translations',
	}, {
		id: 'context-translation-hover',
		type: 'checkbox',
		parentId: 'context-parent',
		title: 'Show Translations on Hover',
	}, {
		id: 'context-translation-hide',
		type: 'checkbox',
		parentId: 'context-parent',
		title: 'Always Hide Translations',
	}, {
		type: 'separator',
		parentId: 'context-parent',
	}, {
		id: 'context-emoji-hide',
		type: 'checkbox',
		parentId: 'context-parent',
		title: 'Hide Emojis',
	}, {
		type: 'separator',
		parentId: 'context-parent',
	}, {
		id: 'context-settings',
		parentId: 'context-parent',
		title: 'Appearance Settings...',
	}
];

function createMenus() {
	return Promise.all(
		menuItems.map(item => {
			return new Promise(resolve => {
				browser.contextMenus.create(item, resolve);
			});
		})
	);
}

function destroyMenus() {
	return browser.contextMenus.removeAll();
}

function handleMenuClick(info, tab) {
	// console.log(info);
}


function handleMessage(message) {
	if (message['type'] === "context-menu") {
		if (message['content'] === 'show') {
			createMenus();
		} else if (message['content'] === 'hide') {
			destroyMenus();
		}
	}
}

browser.runtime.onMessage.addListener(handleMessage);
browser.contextMenus.onClicked.addListener(handleMenuClick);
