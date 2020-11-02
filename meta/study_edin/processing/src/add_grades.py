#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import re
from collections import Counter
from utils import CONFIG_ORDER
from viable import standardize 

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('log', help='Path to Michal\'s tsv log file')
parser.add_argument('blog3o', help='Path to an output blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

with open(args.log, 'r') as f:
    logs = [x.rstrip('\n').split('\t')[5:] for x in f.readlines()]

for s in data:
    s.grade_c = None
    s.grade_v = []
    for (i, line) in enumerate(s.data):
        if line[0] == 'TRANSLATION1':
            src = standardize(line[2])
            tgt = standardize(line[3])
            for log in logs:
                if log[4] == src and log[5] == tgt:
                    s.grade_v.append((i, log))
                    break
        elif line[0] == 'CONFIRM_OK':
            src = standardize(line[3])
            tgt = standardize(line[4])
            for log in logs:
                if log[4] == src and log[5] == tgt:
                    s.grade_c = log
                    break

with open(args.blog3o, 'wb') as f:
    pickle.dump(data, f)