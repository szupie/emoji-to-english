const pattern = buildPattern();
const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (treeWalker.nextNode()) {
	treeWalker.currentNode.nodeValue = treeWalker.currentNode.nodeValue.replace(pattern, replacement);
}

function buildPattern() {
	const pattern = [];

	namesDictionary['ranges'].forEach(range => {
		if (typeof range === 'number') {
			const paddedCodePoint = toPaddedHex(range);
			pattern.push(wrapMatch(escapeUnicode(paddedCodePoint)));
		} else if (Array.isArray(range)) {
			const escapedRange = range.map(value => escapeUnicode(toPaddedHex(value)));
			pattern.push(wrapMatch(`[${escapedRange[0]}-${escapedRange[1]}]`))
		}
	});

	return new RegExp(pattern.join('|'), 'ug');
}

function replacement(match) {
	codePoint = match.codePointAt();
	return `${match}(${namesDictionary['names'][codePoint]})`;
}

function toPaddedHex(number) {
	return (`000000${number.toString(16)}`).slice(-6);
}

function wrapMatch(inside) {
	return `(?:${inside})`;
}

function escapeUnicode(codePoint) {
	return `\\u{${codePoint}}`;
}