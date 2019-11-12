#!/usr/bin/env python3
import argparse
import pickle
from difflib import SequenceMatcher
import re
from utils import prefixMap, isWithoutBacktracking, tokenize, firstViable

# This script processes and outputs Segment Readable and Domain Readable outputs from
# segments blogfile.

parser = argparse.ArgumentParser(description='')
parser.add_argument('blog1file',  help='Path to the binary log 1 (.blog1) file in question')
parser.add_argument('-sr1', '--segments_r1',
                    help='Path to file for segments readable 1 output')
parser.add_argument('-sr2', '--segments_r2',
                    help='Path to file for segments readable 2 output')
parser.add_argument('-sr3', '--segments_r3',
                    help='Path to file for segments readable 3 output')
parser.add_argument('-sr4', '--segments_r4',
                    help='Path to file for segments readable 4 output')
parser.add_argument('-sr5', '--segments_r5',
                    help='Path to file for segments readable 5 output')
args = parser.parse_args()

# Rudimentary statistics for segments, which were completed left to right
def withoutBacktracking(segments):
    out = []
    for segment in segments:
        if isWithoutBacktracking(segment):
            translates = prefixMap(segment, 'TRANSLATE1', lambda x: x['text1'])
            out.append([translates[-1], len(segment)])
    print('Number of all segments:', len(segments))
    print('Number of segments without backtracking:', len(out))
    return out

# SR1
# Each segment progression is turned into the sequence: `<src>, <target>, <back>`.
def segmentR1(segment):
    out = ''
    l1, l2, l3 = '-', '-', '-'
    for line in segment:
        write = False
        if line['type'] == 'TRANSLATE1':
            l1 = line['text1'] # source
            l2 = line['text2'] # target
            write = True
        if line['type'] == 'TRANSLATE2':
            l3 = line['text3'] # back
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
            out += f'{line["text1"]}\n'
    return out + '\n###\n'

# SR3
# Each segment progression is turned into the last two available values for: `<src>, <back>`.
def segmentR3(segment):
    l1, l3 = '-', '-'
    for line in segment:
        if line[1] == 'TRANSLATE1':
            l1 = line['text1'] # source
        if line[1] == 'TRANSLATE2':
            l3 = line['text3'] # back
    return f'{l1}\n{l3}\n###'

# SR4
# Each segment progression is turned into: `<viable>, <src final>, <target final>, <similarity>, <edit types>`
def segmentR4(segment):
    viable = firstViable(segment)
    if viable is None:
        return '<None>|<Linear>\n'
    else:
        viable = viable['text1']
    sm = SequenceMatcher(None, tokenize(viable), tokenize(segment[-1]['text1']))
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
Final: {segment[-1]['text1']}
Translation: {segment[-1]['text2']}
Similarity: {sm.ratio()*100:.2f}%
Equals/Replace/Insert/Delete: {sum_equals}/{sum_replace}/{sum_insert}/{sum_delete}
"""

# SR5
# For each stimuli output the set of all final sources and targets 
def segmentR5(segments):
    out = dict()
    for seg in segments:
        for i in range(len(seg)-1, -1, -1):
            confirm = seg[i]
            if confirm[1] == 'CONFIRM':
                break
        if confirm[1] != 'CONFIRM':
            continue
        out.setdefault(confirm[3], []).append((confirm['text1'], confirm['text2']))
    outStr = ''
    for k, tups in out.items():
        outStr += f'# {k}\n'
        for tup in tups:
            outStr += f'{tup[0]}\n-{tup[1]}\n'
        outStr += '\n'
    return outStr

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
if args.segments_r5 is not None:
    with open(args.segments_r5, 'w') as f:
        f.write(segmentR5(segments))