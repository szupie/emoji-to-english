import os, json

def getFile(path):
	dir = os.path.dirname(__file__)
	return os.path.join(dir, path)

def parseHex(string):
	return int(string, 16)

def getEmojiCodePoints():
	# emoji-data.txt is available at http://www.unicode.org/Public/emoji/
	emojiData = getFile('emoji-data.txt')
	emojiCodePoints = []

	with open(emojiData) as f:
		for line in f:
			if line.strip() and line[0] is not '#':
				codePoints = line.split()[0].split('..')
				if len(codePoints) == 1:
					emojiCodePoints.append(parseHex(codePoints[0]))
				elif len(codePoints) == 2:
					[start, end] = codePoints
					for point in range(parseHex(start), parseHex(end)+1):
						emojiCodePoints.append(point)
				else:
					print('File format error. Line was ' + line)
	return emojiCodePoints
			

def extractNames(emojiCodePoints):
	# UnicodeData.txt is available at http://unicode.org/Public/UNIDATA/
	unicodeData = getFile('UnicodeData.txt')
	names = {}

	with open(unicodeData) as f:
		for line in f:
			fields = line.split(';')
			emojiCodePoint = emojiCodePoints[0]
			codePoint = parseHex(fields[0])
			if codePoint == emojiCodePoint:
				names[codePoint] = fields[1]
				emojiCodePoints.pop(0)
			if len(emojiCodePoints) <= 0: # found all emojis
				break
	return names


namesDict = extractNames(getEmojiCodePoints())
with open(getFile('emojiNames.json'), 'w') as f:
	json.dump(namesDict, f)