const orchestrator = (function(){

	const SETTINGS_REQUEST = SettingsConstants.REQUEST;
	const RequestTypes = SettingsConstants.RequestTypes;

	const settings = {};

	return {
		init
	}


	async function init() {
		// wait for settings to load
		await browser.runtime.sendMessage({
			type: SETTINGS_REQUEST, 
			content: RequestTypes.WAIT_FOR_LOAD
		});
		await emojiReplacer.init();
		domManipulator.start();

		// hide emoji
		if (emojiReplacer.settings['emojiDisplay'] === 'hide') {
			document.body.setAttribute('data-emoji-to-english-hide-emojis', 1);
		}

	}

}());

orchestrator.init();
