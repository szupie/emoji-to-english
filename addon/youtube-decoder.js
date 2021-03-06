const youtubeDecoder = (function(){

	const ytDomain = '.youtube.com';

	const mainDescSelector = '#description.ytd-video-secondary-info-renderer';
	const commentSectionSelector = 
		'ytd-comments#comments, ytm-comment-section-renderer';
	const commentSelector = 'ytd-comment-renderer, ytm-comment-renderer';

	const resultsSelector = 'ytd-search #contents.ytd-item-section-renderer';
	const resultsItemSelector = 'ytd-video-renderer';
	const descSelector = 'yt-formatted-string#description-text';

	const mobileDescParentSelector = 'ytm-slim-video-metadata-renderer';

	const emojiClassNames = emojiReplacer.classNames;

	let pageManagerFound = false;
	let watchedCommentsNode;

	const debouncedTranslatePage = debounce(translatePage, 200);

	return {
		watchPageChanges,
		isYoutube
	}


	function isYoutube() {
		return document.domain.endsWith(ytDomain);
	}

	function runTranslation(root) {
		domManipulator.start(root);
	}

	function clean() {
		// Due to Youtube’s dynamic data binding,
		// new values get added alongside modified textContent.
		// Delete container nodes to prevent old text from persisting.

		// remove main video description
		const vidDescNode = document.querySelector(
			`${mainDescSelector} > ${descSelector}`
		);
		if (vidDescNode) {
			vidDescNode.parentNode.removeChild(vidDescNode);
		}

		// clear all comments on video pages
		const commentsRoot = document.querySelector(commentSectionSelector);
		if (commentsRoot) {
			const commentsParent = commentsRoot.querySelector('#contents');
			if (commentsParent) {
				while (commentsParent.firstChild) {
					commentsParent.removeChild(commentsParent.firstChild);
				}
			}
		}

		// clear search results
		const resultNodes = document.querySelectorAll(
			`${resultsSelector} > ${resultsItemSelector}`
		);
		for (const node of resultNodes) {
			node.parentNode.removeChild(node);
		}
		
	}

	function watchPageChanges() {
		if (isYoutube()) {
			debouncedTranslatePage();

			window.addEventListener("yt-navigate-start", clean);

			document.body.addEventListener(
				"yt-page-data-updated", debouncedTranslatePage
			);
			document.body.addEventListener(
				"yt-navigate-finish", debouncedTranslatePage
			);

			// mobile
			document.documentElement.addEventListener(
				"video-data-change", debouncedTranslatePage
			);
		}
	}

	function translatePage() {
		if (document.querySelector(
			'ytd-watch-flexy:not([hidden]), ytm-watch'
		)) {
			translateVideo();
		} else if (document.querySelector('ytd-search:not([hidden])')) {
			translateSearch();
		}
	}

	function translateVideo() {
		runTranslation(document.querySelector(mainDescSelector));

		const commentsNode = document.querySelector(commentSectionSelector);
		runTranslation(commentsNode);
		watchComments(commentsNode);

		// on mobile, descriptions dynamically loaded after opening accordion
		watchDescMobile();
	}

	function translateSearch() {
		const descriptionNodes = document.querySelectorAll(descSelector);
		for (const node of descriptionNodes) {
			runTranslation(node);
		}
		waitForSearch();
	}

	function watchComments(commentsNode) {
		if (watchedCommentsNode !== commentsNode) {
			new MutationObserver((mutationsList, observer) => {
				for (const mutation of mutationsList) {
					if (mutation.addedNodes.length > 0) {
						for (const node of mutation.addedNodes) {
							if (node.matches && node.matches(commentSelector)) {
								runTranslation(node);
							}
						}
					}
				}
			}).observe(
				commentsNode, 
				{ childList: true, subtree:true }
			);
			watchedCommentsNode = commentsNode;
		}
	}

	function watchSearchResults(searchNode) {
		new MutationObserver((mutationsList, observer) => {
			for (const mutation of mutationsList) {
				if (mutation.addedNodes.length > 0) {
					for (const node of mutation.addedNodes) {
						if (node.matches(resultsItemSelector)) {
							runTranslation(
								node.querySelector(descSelector)
							);
						}
					}
				}
			}
		}).observe(
			searchNode.querySelector(resultsSelector), 
			{ childList: true }
		);
	}
	
	function waitForSearch() {
		if (pageManagerFound) return;
		const pageManagerNode = document.getElementById('page-manager');
		if (pageManagerNode) {
			pageManagerFound = true;
			const searchNode = pageManagerNode.querySelector('ytd-search');
			if (searchNode) {
				watchSearchResults(searchNode);
			} else {
				// wait for search results to be added
				new MutationObserver((mutationsList, observer) => {
					for (const mutation of mutationsList) {
						if (mutation.addedNodes.length > 0) {
							for (const node of mutation.addedNodes) {
								if (node.matches('ytd-search')) {
									observer.disconnect();
									watchSearchResults(node);
								}
							}
						}
					}
				}).observe(
					pageManagerNode, 
					{ childList: true }
				);
			}
		}
	}

	function watchDescMobile() {
		const descContainer = document.querySelector(mobileDescParentSelector);
		if (descContainer) {
			new MutationObserver((mutationsList, observer) => {
				for (const mutation of mutationsList) {
					if (mutation.addedNodes.length > 0) {
						for (const node of mutation.addedNodes) {
							if (node.matches('.user-text')) {
								runTranslation(node);
							}
						}
					}
				}
			}).observe(
				descContainer, 
				{ childList: true }
			);
		}
	}


	// https://davidwalsh.name/javascript-debounce-function
	// Returns a function, that, as long as it continues to be invoked, 
	// will not be triggered. The function will be called after it stops
	// being called for [wait] milliseconds. If immediate is passed, 
	// trigger the function on the leading edge, instead of the trailing.
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

}());
