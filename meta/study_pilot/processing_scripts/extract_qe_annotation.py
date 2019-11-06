#!/usr/bin/env python3
import argparse
import pickle
import json

# Add quality annotations to blog file and convert it to blog2

parser = argparse.ArgumentParser(description='')
parser.add_argument('blogfile',  help='Path to the binary log (.blog) file in question')
parser.add_argument('blog2file',  help='Path to the binary log2 (.blog2) file in question')
parser.add_argument('a0csv',  help='Path to the a0.csv file')
parser.add_argument('-f', '--fix_usid', help='Fix USID mapping and save it to a0csv', action='store_true')
args = parser.parse_args()

# USIDs were off at first
# this function returns a map from the wrong USIDs to proper ones 
def fixUSIDsMap(segments):
    i = 0
    j = 0
    out = dict()
    for seg in segments:
        for line in seg:
            j += 1
            out[j] = i
        i += 1
    return out

with open(args.blogfile, 'rb') as f:
    segments = pickle.load(f)

with open(args.a0csv, 'r') as f:
    a0csv = [x.rstrip('\n').split(',') for x in f.readlines()[1:]]
    a0csv = [[x[0].rstrip('"').lstrip('"').lstrip(" "), int(x[1])] for x in a0csv]

if args.fix_usid:
    USIDmap = fixUSIDsMap(segments)
    for x in a0csv:
        if x[0][0] == 'v':
            x[0] = f'v{USIDmap[int(x[0][1:])]}'
        else:
            x[0] = f'{USIDmap[int(x[0])]}'
    with open(args.a0csv, 'w') as f:
        f.write('"USID","Score"\n')
        for x in a0csv:
            f.write(f'"{x[0]}",{x[1]}\n')

scoreMap = dict()
for x in a0csv:
    scoreMap[x[0]] = x[1]
newSegments = []
for seg in segments:
    newSeg = dict()
    newSeg['items'] = seg
    newSeg['rating'] = dict()
    usid = str(seg[0]['usid'])
    if usid in scoreMap:
        newSeg['rating']['final'] = scoreMap[usid]
        # if scoreMap[usid] != 0:
        #     print(usid) 
        #     print(newSeg['items'][-2]) 
    if 'v' + usid in scoreMap:
        newSeg['rating']['first_viable'] = scoreMap['v' + usid]
    newSegments.append(newSeg)

with open(args.blog2file, 'wb') as f:
    pickle.dump(newSegments, f)
