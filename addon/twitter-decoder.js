const twitterDecoder = (function(){

	const twMutationSelector = '.r-rthrr5, .r-150rngu, .r-1obr2lp';

	const twEmojiSelectors = {
		'r-h9hxbl': 'aria-label',
		'Emoji--forText': 'alt'
	}

	return {
		waitForTweets,
		mightContainEmoji
	}

	function mightContainEmoji(node) {
		return node.matches('twitter-widget') || 
			node.closest(`.${Object.keys(twEmojiSelectors)[0]}`) != null;
	}

	function runTranslation() {
		domManipulator.clean();
		extractTwitterEmojis();
		domManipulator.start(document.body, false);
	}

	function waitForTweets() {
		if (document.domain === "twitter.com") {

			if (findTweetNode()) {
				runTranslation();
			}
			// Wait for Twitter interface to load
			new MutationObserver((mutationsList, observer) => {
				for (let mutation of mutationsList) {
					if (mutation.addedNodes.length) {
						setTimeout(()=>{
							if (findTweetNode()) {
								runTranslation();
							}
						}, 500);
						break;
					}
				}
			}).observe(
				document.querySelector(twMutationSelector), 
				{ childList: true }
			);

		} else {
			const embedNodes = document.querySelector('.twitter-tweet');
			if (embedNodes) {
				// Wait for embedded tweets to load
				new MutationObserver((mutationsList, observer) => {
					for (let mutation of mutationsList) {
						if (mutation.previousSibling.classList.contains(
							'twitter-tweet-rendered')) {
							const roots = [];
							const replacedTweetNodes = 
								document.querySelectorAll('twitter-widget');

							for (const node of replacedTweetNodes) {
								shadow = node.shadowRoot;

								// make changes in shadow DOM scope
								extractTwitterEmojis(shadow);
								shadow.appendChild(buildStyleLink());
								domManipulator.start(shadow, false);
							};

							observer.disconnect();
							break;
						}
					}
				}).observe(embedNodes.parentNode, {childList: true});
			}
		}
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
		const plainTextRE = /\w+/; // matches alphanumeric

		for (className in twEmojiSelectors) {
			const attr = twEmojiSelectors[className];
			const twEmojiSelector = `.${className}[${attr}]`;
			const twEmojiNodes = root.querySelectorAll(twEmojiSelector);
			let emojiChain = '';
			for (const twEmojiNode of twEmojiNodes) {
				let insertPosition = twEmojiNode;
				if (!root.host) { // is not twitter embed widget shadowroot
					insertPosition = twEmojiNode.parentNode;
				}

				let attrText = twEmojiNode.getAttribute(attr);

				const hasPlainText = plainTextRE.test(attrText);
				if (hasPlainText) {
					attrText = emojiReplacer.wrapTranslation(attrText);
				}

				attrText = emojiChain + attrText;

				// combine consecutive emojis for legibility
				const nextNode = insertPosition.nextSibling;
				if (nextNode && nextNode.querySelector &&
					(nextNode.matches(twEmojiSelector) ||
					nextNode.querySelector(twEmojiSelector))
				) {
					emojiChain = attrText;
					continue;
				} else {
					emojiChain = '';
				}

				const newNode = emojiReplacer.createTranslationNode(attrText);
				newNode.classList.add(emojiReplacer.classNames['helper']);

				insertPosition.parentNode.insertBefore(
					newNode, insertPosition.nextSibling
				);
			}
		}
	}

}());
