#!/usr/bin/env python3
import argparse
import pickle

# Add quality annotations to blog file and convert it to blog2

parser = argparse.ArgumentParser(description='')
parser.add_argument('blog2in',  help='Path to input binary log 2 (.blog2) file')
parser.add_argument('blog2out',  help='Path to output binary log 2 (.blog2) file')
parser.add_argument('a0csv',  help='Path to the fixed a0.csv file')
args = parser.parse_args()

with open(args.blog2in, 'rb') as f:
    segments = pickle.load(f)

with open(args.a0csv, 'r') as f:
    a0csv = [x.rstrip('\n').split(',') for x in f.readlines()[1:]]
    a0csv = [[x[0].rstrip('"').lstrip('"').lstrip(" "), int(x[1])] for x in a0csv]

scoreMap = dict()
for x in a0csv:
    scoreMap[x[0]] = x[1]
for seg in segments:
    usid = str(seg['usid'])
    if usid in scoreMap:
        seg['rating']['final'] = scoreMap[usid]
    if 'v' + usid in scoreMap:
        seg['rating']['first_viable'] = scoreMap['v' + usid]

with open(args.blog2out, 'wb') as f:
    pickle.dump(segments, f)