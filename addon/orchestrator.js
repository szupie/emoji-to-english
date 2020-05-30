const orchestrator = (function(){

	const SETTINGS_REQUEST = SettingsConstants.REQUEST;
	const RequestTypes = SettingsConstants.RequestTypes;

	const settings = {};

	return {
		init,
		scan
	}


	async function init() {
		// wait for settings to load
		await browser.runtime.sendMessage({
			type: SETTINGS_REQUEST, 
			content: RequestTypes.WAIT_FOR_LOAD
		});
		await emojiReplacer.init();
		await emojiStyler.init();

		scan(false);
	}

	async function scan(cleanUp=true) {
		if (emojiReplacer.settings === undefined) {
			await emojiReplacer.init();
		}
		if (!youtubeDecoder.isYoutube()) {
			domManipulator.start(cleanUp);
		}
		twitterDecoder.waitForTweets();
		youtubeDecoder.watchPageChanges();
	}

}());

orchestrator.init();
