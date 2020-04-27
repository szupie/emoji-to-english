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
		await emojiStyler.init();
		domManipulator.start();
		twitterDecoder.waitForTweets().then(roots=>{
			if (roots) {
				roots.forEach(root=>{
					domManipulator.start(root, false);
				})
			}
		});
	}

}());

orchestrator.init();
