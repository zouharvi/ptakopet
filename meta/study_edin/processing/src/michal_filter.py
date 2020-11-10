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

def get_first_translate(segment):
    return [x[2] for x in segment.data if x[0] == 'TRANSLATE1'][0]
def get_confirm(segment):
    return [x[3] for x in
     segment.data if x[0] == 'CONFIRM_OK'][0]

data = [x for x in data if not x.invalid]
print('valid', len(data))
data = [x for x in data if len(x.grade_f) != 0 and len(x.grade_v) != 0]
print('graded', len(data))
data = [x for x in data if get_first_translate(x) != get_confirm(x)]
print('first <> final', len(data))

# valid 2752
# graded 1819
# first <> final 919