const contextMenuHandler = (function(){
	const Keys = SettingsConstants.Keys;
	const Values = SettingsConstants.Values;

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
			id: 'context-emoji-shown',
			type: 'checkbox',
			parentId: 'context-parent',
			title: 'Show Emoji',
		}, {
			type: 'separator',
			parentId: 'context-parent',
		}, {
			id: 'context-settings',
			parentId: 'context-parent',
			title: 'Appearance Settings...',
		}
	];

	return {
		init
	}

	function init() {
		browser.runtime.onMessage.addListener(handleMessage);
		browser.contextMenus.onClicked.addListener(handleMenuClick);
	}


	async function createMenus() {
		const displayMode = await settingsManager.get(Keys.DISPLAY_MODE);
		const showEmoji = await settingsManager.get(Keys.SHOW_EMOJI);
		return Promise.all(
			menuItems.map(item => {
				return new Promise(resolve => {
					if (item.id) {
						if (item.id.includes('context-translation-')) {
							item.checked = displayMode === itemIdToValue(item.id);
						} else if (item.id === 'context-emoji-shown') {
							item.checked = showEmoji;
						}
					}
					browser.contextMenus.create(item, resolve);
				});
			})
		);
	}

	function destroyMenus() {
		return browser.contextMenus.removeAll();
	}

	function handleMenuClick(info, tab) {
		let key, value;
		if (info.menuItemId.includes('context-translation-')) {
			key = Keys.DISPLAY_MODE;
			value = itemIdToValue(info.menuItemId);
		} else if (info.menuItemId === 'context-emoji-shown') {
			key = Keys.SHOW_EMOJI;
			value = info.checked;
		} else if (info.menuItemId === 'context-settings') {
			browser.runtime.openOptionsPage()
		}
		browser.tabs.sendMessage(tab.id, {
			'type': 'context-menu-set-setting', 
			'content': {'key': key, 'value': value}
		});
	}

	function itemIdToValue(itemId) {
		switch (itemId) {
			case "context-translation-inline":
				return Values.DisplayModes.INLINE;
			case "context-translation-hover":
				return Values.DisplayModes.TOOLTIP;
			case "context-translation-hide":
				return Values.DisplayModes.NONE;
		}
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

}());

contextMenuHandler.init();
