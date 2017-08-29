const SETTINGS_REQUEST = SettingsConstants.REQUEST;
const RequestTypes = SettingsConstants.RequestTypes;

async function init() {
	await getSettingsFromManager();
	await emojiReplacer.init();
	await emojiStyler.init();
	restoreSettings();
}

function saveSetting(e) {
	const setting = e.target.name;
	let value = e.target.value;

	// cast input value to boolean
	if (e.target.hasAttribute('data-is-boolean')) {
		value = (value === 'true');
	}

	saveSettingToManager(setting, value);

	if (e.target.getAttribute('data-setting-type') === 'style') {
		emojiStyler.set(setting, value);
	} else {
		emojiReplacer.set(setting, value);
	}
	updatePreview();

	document.getElementById('settings').classList.add('changed', 'fresh');
	document.getElementById('changedMessage').addEventListener('transitionend', hideMessage);

	function hideMessage() {
		document.getElementById('settings').classList.remove('fresh');
		document.getElementById('changedMessage').removeEventListener('transitionend', hideMessage);
	}
}

function restoreSettings() {
	const formElements = document.forms[0].elements;

	getSettingsFromManager().then(items => {
		for (let key in items) {
			if (formElements[key]) {
				formElements[key].value = items[key];
			}
		}
		updatePreview();
	}, failure => { console.trace(failure); });
}

function updatePreview() {
	const translatedNode = document.querySelector('#translated samp');
	translatedNode.textContent = document.querySelector('#original samp').textContent;

	emojiReplacer.translateTextNode(translatedNode.childNodes[0]);
}

function getSettingsFromManager() {
	return browser.runtime.sendMessage({
		type: SETTINGS_REQUEST, 
		content: RequestTypes.GET
	});
}

function saveSettingToManager(theKey, theValue) {
	return browser.runtime.sendMessage({
		type: SETTINGS_REQUEST, 
		content: RequestTypes.SET,
		key: theKey,
		value: theValue
	});
}

document.addEventListener("DOMContentLoaded", init);

document.querySelector('form').addEventListener('change', e => saveSetting(e));