import re


# Filter actions, then perform func
# Uses the array object format
def prefixMapArray(logs, prefix, func=lambda x: x):
    return list(map(func, filter(lambda x: x[0] == prefix, logs)))

# Filter actions, then perform func
def prefixMap(logs, prefix, func=lambda x: x):
    return list(map(func, filter(lambda x: x['type'] == prefix, logs['items'])))

# Join array by newlines (syntactic sugar)
def nJoin(l):
    return '\n'.join(l)

# Check whether a given segment was written linearly
def isWithoutBacktracking(segment):
    translates = prefixMap(segment, 'TRANSLATE1', lambda x: x['text1'])
    if len(translates) == 0:
        return None
    prev = ''
    for line in translates:
        if line.startswith(prev):
            prev = line
        else:
            return False
    return True

# Try to extract the first viable source sentence using some rudimentary heuristics
# The viability is considered by the length of the source
def firstViableSrc(segment):
    srcs = prefixMap(segment, 'TRANSLATE1')
    if len(srcs) == 0:
        return None
    longest = sorted(srcs, key=lambda x: len(x['text1']), reverse=True)
    lastConfirmSrc = prefixMap(segment, 'CONFIRM', lambda x: x['text1'])
    if len(lastConfirmSrc) == 0:
        return None
    else:
        lastConfirmSrc = lastConfirmSrc[-1]

    for src in longest:
        if len(src['text1']) == 0:
            return None
        if src['text1'] == lastConfirmSrc:
            continue
        if src['text1'][-1] in ".?" or (len(src['text1']) > 1 and src['text1'][-2] in ".?"):
            return src
    return None


# Try to extract the first viable source sentence using some rudimentary heuristics
# The viability is considered by the length of the translation
def firstViableTrg(segment):
    srcs = prefixMap(segment, 'TRANSLATE1')
    if len(srcs) == 0:
        return None
    longest = sorted(srcs, key=lambda x: len(x['text2']), reverse=True)
    lastConfirmSrc = prefixMap(segment, 'CONFIRM', lambda x: x['text2'])
    if len(lastConfirmSrc) == 0:
        return None
    else:
        lastConfirmSrc = lastConfirmSrc[-1]

    for src in longest:
        if len(src['text2']) == 0:
            return None
        if src['text2'] == lastConfirmSrc:
            continue
        if src['text2'][-1] in ".?" or (len(src['text2']) > 1 and src['text2'][-2] in ".?"):
            return src
    return None


# Check whether a given segment resulted in a skip
def isSkipped(segment):
    return len(prefixMap(segment, 'CONFIRM')) == 0

# Very simple tokenization scheme
def tokenize(raw):
    out = re.split('\?|\.|,|\s+',raw)
    out = list(filter(lambda x: len(x) != 0, out))
    return out