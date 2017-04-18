import xml.etree.ElementTree as ET
import os, json

def getFile(path):
	dir = os.path.dirname(__file__)
	return os.path.join(dir, path)


# Localisation files can be found at:
# http://unicode.org/repos/cldr/tags/latest/common/annotations/

locale = "en" # change to appropriate language code

tree = ET.parse('{}.xml'.format(locale))
annotations = tree.getroot().find('annotations')

dictionary = {}

for annotation in annotations.iter('annotation'):
	character = annotation.get('cp')
	typeAttr = annotation.get('type')

	# Use keywords if no other annotations available
	if character not in dictionary:
		dictionary[character] = annotation.text

	# Use short names when available
	if typeAttr == 'tts':
		dictionary[character] = annotation.text

filePath = getFile('./addon/_locales/{}/messages.json'.format(locale))
os.makedirs(os.path.dirname(filePath), exist_ok=True)

formattedDictionary = {
	character: {'message': dictionary[character]} for character in dictionary
}

with open(filePath, 'w') as f:
	jsonString = json.dumps(formattedDictionary, ensure_ascii=False, sort_keys=True)
	f.write(jsonString)
