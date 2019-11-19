#!/usr/bin/env python3
import argparse
import pickle
from difflib import SequenceMatcher
import re
from functools import reduce
import json
from utils import prefixMap, isWithoutBacktracking, isSkipped, firstViableSrc, firstViableTrg, tokenize

# This script serves to explore phenomena in segments accross domains.
# Phenomena include: distribution of skipped/finished/written linearly/edit types.

parser = argparse.ArgumentParser(description='')
parser.add_argument('blogfile',  help='Path to the binary log (.blog) file in question')
parser.add_argument('-qf', '--questions_flat', help='Path to JSON question map: sid -> question')
parser.add_argument('-d', '--diffs', default='src', choices=['src', 'trg'], help='Do edits analysis on src or trg')

args = parser.parse_args()

# Return list of segments, which correspond to a given domain regex
def domainKeyMap(logs, key, func=lambda x: x):
    out = []
    for seg in logs:
        firstNext = prefixMap(seg, 'NEXT', lambda x: x['sid'])[0]
        if re.match(key, firstNext):
            out.append(seg)
    return out

# Estimate duration of each segment
def segmentTime(segments, maxtime=600):
    total = 0
    faulty = 0
    for seg in segments:
        if seg['items'][-1]['timestamp'] > maxtime:
            faulty += 1
        else:
            total += seg['items'][-1]['timestamp']
    return total/(len(segments)-faulty)


# Split to buckets according to func
# \forall x: x in out[func(x)]
def split(segments, func):
    out = {}
    for seg in segments:
        val = func(seg)
        out.setdefault(val, []).append(seg)
    return out

# Return quintuples of edit distributions between the first viable and the confirmed input.
# (similarity ratio, % of equals, % of replaces, % of inserts, % of deletions)
# None if first viable is not found
def firstViableSrcEditsDistribution(segment):
    viable = firstViableSrc(segment)
    if viable is None:
        return None
    else:
        viable = viable['text1']
    lastConfirmSrc = prefixMap(segment, 'CONFIRM', lambda x: x['text1'])[-1]
    sm = SequenceMatcher(None, tokenize(viable), tokenize(lastConfirmSrc))
    opcodes = sm.get_opcodes()
    opcodes_equals = list(filter(lambda x: x[0] == 'equal', opcodes))
    opcodes_replace = list(filter(lambda x: x[0] == 'replace', opcodes))
    opcodes_insert = list(filter(lambda x: x[0] == 'insert', opcodes))
    opcodes_delete = list(filter(lambda x: x[0] == 'delete', opcodes))
    sum_equals = sum(map(lambda x: x[2] - x[1], opcodes_equals))
    sum_replace = sum(map(lambda x: x[2] - x[1], opcodes_replace))
    sum_insert = sum(map(lambda x: x[2] - x[1], opcodes_insert))
    sum_delete = sum(map(lambda x: x[2] - x[1], opcodes_delete))
    sum_all = float(sum_equals + sum_replace + sum_insert + sum_delete)
    return (sm.ratio(), sum_equals/sum_all, sum_replace/sum_all, sum_insert/sum_all, sum_delete/sum_all)



# Return quintuples of edit distributions between the first viable and the confirmed output.
# (similarity ratio, % of equals, % of replaces, % of inserts, % of deletions)
# None if first viable is not found
def firstViableTrgEditsDistribution(segment):
    viable = firstViableTrg(segment)
    if viable is None:
        return None
    else:
        viable = viable['text2']
    lastConfirmTrg = prefixMap(segment, 'CONFIRM', lambda x: x['text2'])[-1]
    sm = SequenceMatcher(None, tokenize(viable), tokenize(lastConfirmTrg))
    opcodes = sm.get_opcodes()
    opcodes_equals = list(filter(lambda x: x[0] == 'equal', opcodes))
    opcodes_replace = list(filter(lambda x: x[0] == 'replace', opcodes))
    opcodes_insert = list(filter(lambda x: x[0] == 'insert', opcodes))
    opcodes_delete = list(filter(lambda x: x[0] == 'delete', opcodes))
    sum_equals = sum(map(lambda x: x[2] - x[1], opcodes_equals))
    sum_replace = sum(map(lambda x: x[2] - x[1], opcodes_replace))
    sum_insert = sum(map(lambda x: x[2] - x[1], opcodes_insert))
    sum_delete = sum(map(lambda x: x[2] - x[1], opcodes_delete))
    sum_all = float(sum_equals + sum_replace + sum_insert + sum_delete)
    return (sm.ratio(), sum_equals/sum_all, sum_replace/sum_all, sum_insert/sum_all, sum_delete/sum_all)

with open(args.blogfile, 'rb') as f:
    segments = pickle.load(f)

domainNames = {'s': 'SQuAD', 'z': 'SQuAD-cs', 't': 'Tech issues', 'p': 'Administrative issues', '.': 'All'}

# Main cycle (entry poitn)
for domain, domainName in domainNames.items():
    domainReg = domain + r'\d\d'
    dSegments = domainKeyMap(segments, domainReg)
    sSkipped = split(dSegments, isSkipped) 
    sLinear = split(sSkipped[False], isWithoutBacktracking) 
    if args.diffs == 'src':
        sEdits = map(firstViableSrcEditsDistribution, sLinear[False])
    elif args.diffs == 'trg':
        sEdits = map(firstViableTrgEditsDistribution, sLinear[False])
    sEdits = list(filter(lambda x: x, sEdits))
    avgSimilarity = sum(map(lambda x: x[0], sEdits))/len(sEdits)
    avgDistribution = reduce(lambda x, y: (x[0]+y[0], x[1]+y[1], x[2]+y[2], x[3]+y[3], x[4]+y[4]), sEdits)

    print(f'{domainName} {len(dSegments)} ({segmentTime(dSegments):.0f}s)')
    
    print(f'- skipped: {len(sSkipped[True])}')
    print(f'- finished: {len(sSkipped[False])}')
    print(f'- - linear: {len(sLinear[True])}')
    print(f'- - with edits: {len(sLinear[False])}')
    print(f'- - - avg similarity: {avgSimilarity*100:.2f}%')
    print(f'- - - equal: {avgDistribution[1]/len(sEdits)*100:.2f}%')
    print(f'- - - replace: {avgDistribution[2]/len(sEdits)*100:.2f}%')
    print(f'- - - insert: {avgDistribution[3]/len(sEdits)*100:.2f}%')
    print(f'- - - delete: {avgDistribution[4]/len(sEdits)*100:.2f}%')

# Only for technical issues check how much it overlaps  
if args.questions_flat != None:
    print('\nSpecific for tech issues:')
    with open(args.questions_flat, 'r') as f:
        questions = json.loads(f.read())
    questions = {k:v.replace('*', '') for k,v in questions.items()}
    techSegments = domainKeyMap(segments, 't[0-9]{2}')
    lineRatios = []
    confirmRatios = []
    for seg in techSegments:
        question = questions[seg['sid']]
        if not isSkipped(seg):
            translates = prefixMap(seg, 'TRANSLATE1', lambda x: x['text1'])
            # these two are the same on the collected data
            if True:
                sm = SequenceMatcher(None, tokenize(question), tokenize(translates[0]))
                maxR = sm.ratio()
            else: 
                maxR = -1
                for line in translates:
                    sm = SequenceMatcher(None, tokenize(question), tokenize(line))
                    maxR = max(sm.ratio(), maxR)
                maxR = max(sm.ratio(), maxR)
            lineRatios.append(maxR)

            lastConfirmSrc = prefixMap(seg, 'CONFIRM', lambda x: x['text1'])[-1]
            sm = SequenceMatcher(None, tokenize(question), tokenize(lastConfirmSrc))
            confirmRatios.append(sm.ratio())


    copied = len(list(filter(lambda x: x == 1.0, lineRatios)))
    submitted = len(list(filter(lambda x: x == 1.0, confirmRatios)))
    total = len(lineRatios)
    print(f'first copied: {copied}, copied & submitted: {submitted}, Total: {total}')