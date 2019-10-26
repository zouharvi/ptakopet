#!/usr/bin/env python3
import argparse
import pickle
from difflib import SequenceMatcher
import re

# TODO: documentation

parser = argparse.ArgumentParser(description='')
parser.add_argument('blogfile',  help='Path to the binary log (.blog) file in question')
parser.add_argument('-sr1', '--segments_r1',
                    help='Path to file for segments readable 1 output')
parser.add_argument('-sr2', '--segments_r2',
                    help='Path to file for segments readable 2 output')
parser.add_argument('-sr3', '--segments_r3',
                    help='Path to file for segments readable 3 output')
parser.add_argument('-sr4', '--segments_r4',
                    help='Path to file for segments readable 4 output')
args = parser.parse_args()

# Filter actions, then perform func
def prefixMap(logs, prefix, func=lambda x: x):
    return list(map(func, filter(lambda x: x[1] == prefix, logs)))

# Rudimentary statistics for segments, which were completed left to right
def withoutBacktracking(segments):
    out = []
    for segment in segments:
        translates = prefixMap(segment, 'TRANSLATE1', lambda x: x[3])
        if len(translates) == 0:
            continue
        prev = ''
        ok = True
        for line in translates:
            if line.startswith(prev):
                prev = line
            else:
                ok = False
                break
        if ok:
            out.append([line, len(segment)])
    print('Number of all segments:', len(segments))
    print('Number of segments without backtracking:', len(out))
    return out

def flatten(l):
    return [item for sublist in l for item in sublist]

# SR1
# Each segment progression is turned into the sequence: `<src>, <target>, <back>`.
def segmentR1(segment):
    out = ''
    l1, l2, l3 = '-', '-', '-'
    for line in segment:
        write = False
        if line[1] == 'TRANSLATE1':
            l1 = line[3] # source
            l2 = line[4] # target
            write = True
        if line[1] == 'TRANSLATE2':
            l3 = line[4] # back
            # write = True
        if write:
            out += f'{l1}\n{l2}\n{l3}\n--\n'
    return out + '\n###\n'

# SR2
# Each segment progression is turned into the sequence: `<src>`.
def segmentR2(segment):
    out = ''
    for line in segment:
        if line[1] == 'TRANSLATE1':
            out += f'{line[3]}\n'
    return out + '\n###\n'

# SR3
# Each segment progression is turned into the last two available values for: `<src>, <back>`.
def segmentR3(segment):
    l1, l3 = '-', '-'
    for line in segment:
        if line[1] == 'TRANSLATE1':
            l1 = line[3] # source
        if line[1] == 'TRANSLATE2':
            l3 = line[4] # back
    return f'{l1}\n{l3}\n###'

# Try to extract the first viable source sentence using some rudimentary heuristics
def firstViableSrc(segment):
    srcs = prefixMap(segment, 'TRANSLATE1', lambda x: x[3])
    if len(srcs) == 0:
        return None
    longest = sorted(srcs, key=lambda x: len(x), reverse=True)

    for src in longest:
        if len(src) == 0:
            return None
        if src == segment[-1][4]:
            continue
        if src[-1] in ".?" or (len(src) > 1 and src[-2] in ".?"):
            return src
    return None

# Very simple tokenization scheme
def tokenize(raw):
    out = re.split('\?|\.|,|\s+',raw)
    out = list(filter(lambda x: len(x) != 0, out))
    return out

# SR4
# Each segment progression is turned into: `<viable>, <src final>, <target final>, <similarity>, <edit types>`
def segmentR4(segment):
    viable = firstViableSrc(segment)
    if not viable:
        return ''
    sm = SequenceMatcher(None, tokenize(viable), tokenize(segment[-1][4]))
    opcodes = sm.get_opcodes()
    opcodes_equals = list(filter(lambda x: x[0] == 'equal', opcodes))
    opcodes_replace = list(filter(lambda x: x[0] == 'replace', opcodes))
    opcodes_insert = list(filter(lambda x: x[0] == 'insert', opcodes))
    opcodes_delete = list(filter(lambda x: x[0] == 'delete', opcodes))
    sum_equals = sum(map(lambda x: x[2] - x[1], opcodes_equals))
    sum_replace = sum(map(lambda x: x[2] - x[1], opcodes_replace))
    sum_insert = sum(map(lambda x: x[2] - x[1], opcodes_insert))
    sum_delete = sum(map(lambda x: x[2] - x[1], opcodes_delete))
    return \
f"""\
First: {viable}
Final: {segment[-1][4]}
Translation: {segment[-1][5]}
Similarity: {sm.ratio()*100:.2f}%
Equals/Replace/Insert/Delete: {sum_equals}/{sum_replace}/{sum_insert}/{sum_delete}
"""

# Store output given segments list, function func: segment -> string and a filename
# Used for SR[0-9]+ outputs
def outputSegmentsR(segments, func, outfile):
    out = [func(s) for s in segments]
    with open(outfile, 'w') as f:
        f.write('\n'.join(out))

# Print given segments list, function func: segment -> string and a filename
# Used for SR[0-9]+ outputs
def printSegmentsR(segments, func, _=""):
    out = [func(s) for s in segments]
    print('\n'.join(out))

with open(args.blogfile, 'rb') as f:
    segments = pickle.load(f)

withoutBacktracking(segments)
if args.segments_r1 is not None:
    outputSegmentsR(segments, segmentR1, args.segments_r1)
if args.segments_r2 is not None:
    outputSegmentsR(segments, segmentR2, args.segments_r2)
if args.segments_r3 is not None:
    outputSegmentsR(segments, segmentR3, args.segments_r3)
if args.segments_r4 is not None:
    outputSegmentsR(segments, segmentR4, args.segments_r4)