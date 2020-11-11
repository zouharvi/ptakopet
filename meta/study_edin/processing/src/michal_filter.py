#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [x for x in data if not x.invalid]
print('valid', len(data))
data = [x for x in data if len(x.grade_f) != 0 and len(x.grade_v) != 0]
print('graded', len(data))
data = [x for x in data if any([x.grade_f[0].src != viable.src for viable in x.grade_v])]
print('first <> final', len(data))

# valid 2752
# graded 1819
# first <> final 499