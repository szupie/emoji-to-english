const orchestrator = (function(){

	const settings = {};

	return {
		init
	}


	async function init() {
		await browser.runtime.sendMessage({
			'type': 'settings-request', 
			'content': 'ready'
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
