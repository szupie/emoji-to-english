const menuItems = [
	{
		id: 'context-parent',
		title: 'Emoji Settings',
		contexts: ['link', 'page'],
	}, {
		id: 'context-translation-inline',
		type: 'radio',
		parentId: 'context-parent',
		title: 'Always Show Translation',
	}, {
		id: 'context-translation-hover',
		type: 'radio',
		parentId: 'context-parent',
		title: 'Show Translation on Hover',
	}, {
		id: 'context-translation-hide',
		type: 'radio',
		parentId: 'context-parent',
		title: 'Always Hide Translation',
	}, {
		type: 'separator',
		parentId: 'context-parent',
	}, {
		id: 'context-emoji-hide',
		type: 'checkbox',
		parentId: 'context-parent',
		title: 'Hide Emoji',
	}, {
		type: 'separator',
		parentId: 'context-parent',
	}, {
		id: 'context-settings',
		parentId: 'context-parent',
		title: 'Appearance Settings...',
	}
];

function createMenus(items) {
	items.forEach(item => {
		browser.contextMenus.create(item)
	});
}


createMenus(menuItems);
