const twitterDecoder = (function(){

	const twDomains = ["twitter.com", "mobile.twitter.com"];
	const twMainSelector = '.r-rthrr5, .r-150rngu, .r-1obr2lp';
	const profileSelector = '.r-1cad53l, .r-ku1wi2';
	const contentSelector = '.r-779j7e, .r-1j3t67a, .r-1w50u8q.r-o7ynqc';
	const twEmojiSelectors = [
		{
			'class': 'r-h9hxbl',
			'attr': 'aria-label'
		}, {
			'class': 'Emoji--forText',
			'attr': 'alt'
		}
	];

	const emojiClassNames = emojiReplacer.classNames;

	return {
		waitForTweets,
		mightContainEmoji
	}


	function runTranslation(root=document.body, cleanUp=true) {
		if (cleanUp) {
			domManipulator.clean(root);
		}
		extractTwitterEmojis(root);
		domManipulator.start(root, false);
	}

	function handleAddedNodeOnTwitter(addedNode) {
		// ignore changes created by this script
		if (addedNode.matches(`.${emojiClassNames['helper']}`)) {
			return;
		}

		// rescan profile node on changes
		const profileNode = document.querySelector(profileSelector);
		if (profileNode && profileNode.contains(addedNode)) {
			runTranslation(profileNode);
		}

		// translate newly loaded content
		const contentNodes = addedNode.querySelectorAll(contentSelector);
		for (const contentNode of contentNodes) {
			// skip already-translated nodes
			if (!contentNode.querySelector(`.${emojiClassNames['helper']}`)) {
				// only process tweets lower on page to prevent scroll jumping
				// due to text reflow from translations
				if (contentNode.getBoundingClientRect().bottom > 0) {
					runTranslation(contentNode, false);
				}
			}
		}
	}

	function handleEmbedMutations(mut, observer) {
		if (mut.previousSibling.classList.contains('twitter-tweet-rendered')) {
			const roots = [];
			const embedNodes = document.querySelectorAll('twitter-widget');

			for (const embedNode of embedNodes) {
				shadowRoot = embedNode.shadowRoot;

				// make changes in shadow DOM scope
				runTranslation(shadowRoot, false);
				shadowRoot.appendChild(buildStyleLink());
			};

			observer.disconnect();
			return true;
		}
		return false;
	}

	function waitForTweets() {
		if (twDomains.some(twDomain => document.domain === twDomain)) {
			if (findTweetNode()) {
				runTranslation();
			}
			// Continuously observe for lazy-loaded content on twitter.com
			new MutationObserver((mutationsList, observer) => {
				for (let mutation of mutationsList) {
					const addedNode = mutation.addedNodes[0];
					if (addedNode) {
						handleAddedNodeOnTwitter(addedNode);
					}
				}
			}).observe(
				document.querySelector(twMainSelector), 
				{ childList: true, subtree:true }
			);

		} else {
			const embedNode = document.querySelector('.twitter-tweet');
			if (embedNode) {
				// Wait for embedded tweets to load
				new MutationObserver((mutationsList, observer) => {
					for (let mutation of mutationsList) {
						if (handleEmbedMutations(mutation, observer)) {
							break;
						}
					}
				}).observe(embedNode.parentNode, {childList: true});
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

	function extractTwitterEmojis(root=document.body) {
		const plainTextRE = /\w+/; // matches alphanumeric

		let selectorType = 0;
		// different selectors for embedded tweets
		if (root.getRootNode() !== document) {
			selectorType = 1;
		}

		const className = twEmojiSelectors[selectorType]['class'];
		const attr = twEmojiSelectors[selectorType]['attr'];

		const twEmojiSelector = `.${className}[${attr}]`;
		const twEmojiNodes = root.querySelectorAll(twEmojiSelector);

		let emojiChain = '';
		for (const twEmojiNode of twEmojiNodes) {
			let insertPosition = twEmojiNode;
			if (selectorType === 0) {
				// on twitter.com, insert after fixed-width parent node
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
			newNode.classList.add(emojiClassNames['helper']);

			insertPosition.parentNode.insertBefore(
				newNode, insertPosition.nextSibling
			);
		}
	}

	function mightContainEmoji(node) {
		return node.matches('twitter-widget') || 
			node.closest(`.${twEmojiSelectors[0]['class']}`) != null;
	}

}());
