"use strict";

const SettingsConstants = Object.freeze(function(){

	const REQUEST = 'settings-request';

	const RequestTypes = Object.freeze({
		WAIT_FOR_LOAD: 'waitForLoad',
		GET: 'get',
		SET: 'set'
	});


	const TranslationSettings = Object.freeze({
		DISPLAY_MODE: 'displayMode',
		WRAPPER: 'wrapper',
		WRAPPER_START: 'wrapperStart',
		WRAPPER_END: 'wrapperEnd',
		IGNORE_LIST: 'ignoreList'
	});

	const StyleSettings = Object.freeze({
		SHOW_EMOJI: 'showEmoji'
	});

	const Keys = Object.freeze(
		Object.assign({}, TranslationSettings, StyleSettings)
	);


	const DisplayModes = Object.freeze({
		TOOLTIP: 'tooltip',
		INLINE: 'inline',
		NONE: 'none'
	});

	const Values = Object.freeze({
		DisplayModes
	});


	return Object.freeze({
		REQUEST,
		RequestTypes,
		Keys,
		Values
	});

}());
