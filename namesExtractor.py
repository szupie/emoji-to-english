import os, json, re

def getFile(path):
	dir = os.path.dirname(__file__)
	return os.path.join(dir, path)

# emoji-test.txt is available at 
# https://www.unicode.org/Public/emoji/latest/emoji-test.txt
emojiFile = getFile('emoji-test.txt')
dictionary = {}
count = 0

with open(emojiFile) as f:
	currentGroup = ""
	groupPrefix = "# group: "
	currentSubgroup = ""
	subgroupPrefix = "# subgroup: "
	for line in f:
		if line.strip() and line[0] != '#':
			comment = line.split('#', 1)[1].strip()
			[emoji, name] = comment.split(" ", 1)
			# strip version info on newer emoji-test.txts
			name = re.compile('E[0-9.]+ (.*)').match(name).groups()[0]
			dictionary[currentGroup][currentSubgroup][emoji] = name
			count += 1
		elif line.find(groupPrefix) == 0:
			currentGroup = line[len(groupPrefix):].strip()
			dictionary[currentGroup] = {}
		elif line.find(subgroupPrefix) == 0:
			currentSubgroup = line[len(subgroupPrefix):].strip()
			dictionary[currentGroup][currentSubgroup] = {}

with open(getFile('addon/names-dict.js'), 'w') as f:
	jsonString = json.dumps(dictionary, ensure_ascii=False, sort_keys=True)
	f.write('const namesDictionary = ' + jsonString + ';')

print("{} emoji sequences parsed.".format(count))
