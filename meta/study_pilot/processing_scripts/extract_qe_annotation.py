#!/usr/bin/env python3
import argparse
import pickle

# Add quality annotations to blog file and convert it to blog

parser = argparse.ArgumentParser(description='')
parser.add_argument('blogin',  help='Path to input binary log (.blog) file')
parser.add_argument('blogout',  help='Path to output binary log (.blog) file')
parser.add_argument('a0csv',  help='Path to the fixed a0.csv file')
args = parser.parse_args()

with open(args.blogin, 'rb') as f:
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

with open(args.blogout, 'wb') as f:
    pickle.dump(segments, f)