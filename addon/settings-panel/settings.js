async function init() {
	await getSettingsFromManager();
	await emojiReplacer.init();
	restoreSettings();
}

function saveSetting(e) {
	const setting = e.target.name;
	let value = e.target.value;
	if (e.target.hasAttribute('data-is-boolean')) {
		value = (value === 'true');
	}
	saveSettingToManager(setting, value);
	emojiReplacer.set(setting, value);
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
	});
}

function updatePreview() {
	const translatedNode = document.querySelector('#translated samp');
	translatedNode.textContent = document.querySelector('#original samp').textContent;

	emojiReplacer.translateTextNode(translatedNode.childNodes[0]);
}

function getSettingsFromManager() {
	return browser.runtime.sendMessage({
		'type': 'settings-request', 
		'content': 'get'
	});
}

function saveSettingToManager(key, value) {
	return browser.runtime.sendMessage({
		'type': 'settings-request', 
		'content': 'set',
		'key': key,
		'value': value
	});
}

document.addEventListener("DOMContentLoaded", init);

document.querySelector('form').addEventListener('change', e => saveSetting(e));