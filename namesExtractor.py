import os, json

def getFile(path):
	dir = os.path.dirname(__file__)
	return os.path.join(dir, path)

# emoji-test.txt is available at http://www.unicode.org/Public/emoji/
emojiFile = getFile('emoji-test.txt')
dictionary = {}
count = 0

with open(emojiFile) as f:
	currentGroup = ""
	groupPrefix = "# group: "
	currentSubgroup = ""
	subgroupPrefix = "# subgroup: "
	for line in f:
		if line.strip() and line[0] is not '#':
			comment = line.split('#', 1)[1].strip()
			[emoji, name] = comment.split(" ", 1)
			dictionary[currentGroup][currentSubgroup][emoji] = name
			count += 1
		elif line.find(groupPrefix) is 0:
			currentGroup = line[len(groupPrefix):].strip()
			dictionary[currentGroup] = {}
		elif line.find(subgroupPrefix) is 0:
			currentSubgroup = line[len(subgroupPrefix):].strip()
			dictionary[currentGroup][currentSubgroup] = {}

with open(getFile('addon/names-dict.js'), 'w') as f:
	jsonString = json.dumps(dictionary, ensure_ascii=False, sort_keys=True)
	f.write('const namesDictionary = ' + jsonString + ';')

print("{} emoji sequences parsed.".format(count))
