# Localisation files can be found at:
# https://github.com/unicode-org/cldr/tree/master/common/annotations

import argparse
import xml.etree.ElementTree as ET
import os, json

def getFile(path):
	dir = os.path.dirname(__file__)
	return os.path.join(dir, path)


parser = argparse.ArgumentParser()
parser.add_argument("src", help="directory containing CLDR annotations xml files")
args = parser.parse_args()

srcDir = getFile(args.src)
langs = []

for filename in os.listdir(srcDir):
	locale = os.path.splitext(filename)[0]
	langs.append(locale)

	tree = ET.parse(os.path.join(srcDir, filename))
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
		character: {
			'message': dictionary[character]
		} for character in dictionary
	}

	with open(filePath, 'w') as f:
		jsonString = json.dumps(formattedDictionary, ensure_ascii=False, sort_keys=True)
		f.write(jsonString)
		print("Written to", filePath)

print('{} annotation files parsed: {}'.format(len(langs), ', '.join(langs)))