# Emoji to English
_When your friends be like 🙆 and you all 😕[:CONFUSED FACE:] <sup>*</sup>_

An add-on for translating emojis to their Unicode names

--


This add-on is available for 
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/emoji-to-english/) and
- [Chrome](https://chrome.google.com/webstore/detail/emoji-to-english/jjlpnhlbcmdgoggmnkjdgnodphmoppig)



## Development

#### Building Unicode names dictionary
The dictionary for the Unicode names is not included in this repository, but can easily be built using the latest Unicode data:

1. Download desired version of `emoji-test.txt` from http://www.unicode.org/Public/emoji/
2. Move `emoji-test.txt` to the same directory as `namesExtractor.py`
3. Run `python namesExtractor.py` in a terminal

`names-dict.js` will be created in `./addon`.


#### WebExtensions
This add-on was written as a WebExtension. [MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) has some good resources to help you get started.

*[MDN]:  Mozilla Developer Network


--

<sup>* _oh god oblique emojis are even worse_</sup>
