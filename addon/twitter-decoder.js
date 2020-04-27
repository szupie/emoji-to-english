const twitterDecoder = (function(){

	return {
		waitForTweets
	}

	function waitForTweets() {
		return new Promise(resolve => {
			if (document.domain === "twitter.com") {

				if (findTweetNode()) {
					resolve(true);
				} else {
					// Wait for Twitter interface to load
					new MutationObserver((mutationsList, observer) => {
						for (let mutation of mutationsList) {
							if (findTweetNode()) {
								extractTwitterEmojis();
								resolve([document.body]);

								observer.disconnect();
								break;
							}
						}
					}).observe(document.body, { childList: true });
				}

			} else {
				const embedNodes = 
					document.querySelectorAll('.twitter-tweet');
				if (embedNodes) {
					// Wait for embedded tweets to load
					new MutationObserver((mutationsList, observer) => {
						for (let mutation of mutationsList) {
							if (mutation.previousSibling.classList.contains(
								'twitter-tweet-rendered'
							)) {
								const roots = [];
								const replacedTweetNodes = 
									document.querySelectorAll('twitter-widget');

								for (const node of replacedTweetNodes) {
									shadow = node.shadowRoot;
									roots.push(shadow);

									// make changes in shadow DOM scope
									extractTwitterEmojis(shadow);
									shadow.appendChild(buildStyleLink());
								};
								resolve(roots);

								observer.disconnect();
								break;
							}
						}
					}).observe(embedNodes[0].parentNode, {childList: true});
				} else {
					resolve(false);
				}
			}
		});
	}

	function findTweetNode() {
		return document.querySelector('[data-testid="tweet"]');
	}

	function buildStyleLink() {
		const linkElem = document.createElement('link');
		linkElem.setAttribute('rel', 'stylesheet');
		linkElem.setAttribute('href', browser.runtime.getURL(
			"emoji-to-english.css"
		));
		return linkElem;
	}

	function extractTwitterEmojis(root=document) {
		const classAttrPair = {
			'.r-h9hxbl': 'aria-label',
			'.Emoji--forText': 'alt'
		}
		for (identifier in classAttrPair) {
			const attr = classAttrPair[identifier];
			const twEmojiNodes = root.querySelectorAll(
				`${identifier}[${attr}]`
			);
			for (const twEmojiNode of twEmojiNodes) {
				let insertPosition = twEmojiNode;
				if (!root.host) { // is not twitter widget shadowroot
					insertPosition = twEmojiNode.parentNode;
				}

				let emoji = twEmojiNode.getAttribute(attr);

				// combine consecutive emojis for legibility
				prevNode = insertPosition.previousSibling;
				try {
					if (prevNode.classList.contains(
						emojiReplacer.classNames['helper']
					)) {
						emoji = prevNode.textContent + emoji;
						prevNode.parentNode.removeChild(prevNode);
					}
				} catch(e) {
				}

				// create hidden node with extracted emoji characters
				const newEmojiNode = document.createElement('span'); 
				newEmojiNode.classList.add(emojiReplacer.classNames['helper']);
				newEmojiNode.appendChild(document.createTextNode(emoji));

				insertPosition.parentNode.insertBefore(
					newEmojiNode, insertPosition.nextSibling
				);
			}
		}
	}

}());
