#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import re
from collections import Counter

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

valid_data = [x for x in data if not x.invalid]

def viable(text):
    return re.match(r"^.*[\.\?]\s*$", text)

count = 0
length_ratios = []
for segment in valid_data:
    out = []
    for line in segment.data:
        if line[0] == 'CONFIRM_OK':
            confirm_viable = viable(line[3])
            confirm_sent = line[3].strip()
            if not viable(confirm_sent):
                confirm_last = line[3].strip().split(' ')[-1]
    for line in segment.data:
        if line[0] == 'TRANSLATE1' and line[2].strip() != confirm_sent:
            if viable(line[2]) or (not confirm_viable and line[2].rstrip().split(' ')[-1] == confirm_last):
                out.append(line[2])
    out = set(out)
    if len(out) != 0:
        length_ratios += [len(x)/len(confirm_sent) for x in out]
    count += len(out)

print('Unique viables', count)
print('Segments', len(valid_data))
print('Ratio', count/len(valid_data))
print('Avg length ratios', sum(length_ratios)/len(length_ratios))