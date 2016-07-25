function saveSetting(e) {
	obj = {};
	const setting = e.target.name;
	let value = e.target.value;
	if (e.target.hasAttribute('data-is-boolean')) {
		value = (value === 'true');
	}
	obj[setting] = value;
	chrome.storage.local.set(obj);
	emojiReplacer.set(setting, value);
	displayPreview();

	document.getElementById('settings').classList.add('changed', 'fresh');
	document.getElementById('changedMessage').addEventListener('transitionend', hideMessage);

	function hideMessage() {
		document.getElementById('settings').classList.remove('fresh');
		document.getElementById('changedMessage').removeEventListener('transitionend', hideMessage);
	}
}

function restoreSettings() {
	chrome.storage.local.get(null, (res) => {
		if (Object.keys(res).length <= 0) {
			for (let setting in emojiReplacer.settings) {
				document.forms[0].elements[setting].value = emojiReplacer.settings[setting];
			}
		} else {
			for (let setting in res) {
				document.forms[0].elements[setting].value = res[setting];
				emojiReplacer.set(setting, res[setting]);
			}
		}
		displayPreview();
	});
}

function displayPreview() {
	const original = document.querySelector('#original samp').textContent;
	const translatedNode = document.querySelector('#translated samp');

	translatedNode.textContent = original.replace(emojiReplacer.pattern, emojiReplacer.replaceMatch);
}

document.addEventListener("DOMContentLoaded", restoreSettings);

document.querySelector('form').addEventListener('change', e => saveSetting(e));