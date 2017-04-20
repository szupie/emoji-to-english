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
3. Run `python3 namesExtractor.py` in a terminal

`names-dict.js` will be created in `./addon`.

#### Building localisation files
Translations can also be generated from CLDR annotations:

1. Download annotations file(s) for desired language(s) from http://unicode.org/repos/cldr/tags/latest/common/annotations/
2. Create a directory containing only the annotation file(s)
3. Run `python3 localisationExtractor.py PATH_TO_DIRECTORY` in a terminal


#### WebExtensions
This add-on was written as a WebExtension. [MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) has some good resources to help you get started.

*[MDN]:  Mozilla Developer Network


--

<sup>* _oh god oblique emojis are even worse_</sup>
