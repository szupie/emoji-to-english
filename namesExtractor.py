import os, json

def getFile(path):
	dir = os.path.dirname(__file__)
	return os.path.join(dir, path)

def parseHex(string):
	return int(string, 16)

def getEmojiCodePoints():
	# emoji-data.txt is available at http://www.unicode.org/Public/emoji/
	emojiData = getFile('emoji-data.txt')
	emojiCodePoints = set()

	with open(emojiData) as f:
		for line in f:
			if line.strip() and line[0] is not '#':
				noComment = line.split('#')[0].strip()
				if 'Emoji_Presentation' in noComment.split(';')[1]:
					codePoints = noComment.split()[0].split('..')
					if len(codePoints) == 1:
						emojiCodePoints.add(parseHex(codePoints[0]))
					elif len(codePoints) == 2:
						[start, end] = codePoints
						for point in range(parseHex(start), parseHex(end)+1):
							emojiCodePoints.add(point)
					else:
						print('File format error. Line was ' + line)
	return list(emojiCodePoints)

def getRangesFromPoints(points):
	ranges = []
	currentRange = []
	for i, point in enumerate(points):
		currentRange.append(point)
		#print(currentRange)
		if i >= len(points)-1 or points[i+1] - point > 1: # if next point is last, or not consecutive
			if len(currentRange) > 1:
				ranges.append([currentRange[0], currentRange[-1]])
			else:
				ranges.append(currentRange[0])
			currentRange = []
	return ranges


def extractNames(emojiCodePoints):
	# UnicodeData.txt is available at http://unicode.org/Public/UNIDATA/
	unicodeData = getFile('UnicodeData.txt')
	names = {}

	with open(unicodeData) as f:
		index = 0
		for line in f:
			fields = line.split(';')
			emojiCodePoint = emojiCodePoints[index]
			codePoint = parseHex(fields[0])
			if codePoint == emojiCodePoint:
				names[codePoint] = fields[1]
				index += 1
			if index >= len(emojiCodePoints): # found all emojis
				break
	return names


codePoints = getEmojiCodePoints()
codePoints.sort()

ranges = getRangesFromPoints(codePoints)
namesDict = extractNames(codePoints)

with open(getFile('addon/names-dict.js'), 'w') as f:
	jsonString = json.dumps({'ranges': ranges, 'names': namesDict})
	f.write('const namesDictionary = ' + jsonString + ';')