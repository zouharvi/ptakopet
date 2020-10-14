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

valid_data_c = Counter([x.uid for x in data if not x.invalid])
valid_data = {x.uid for x in data if not x.invalid}
invalid_data = {x.uid for x in data if x.invalid}

print('TOT users:', len({x.uid for x in data}))
print('OK  users:', len({k for k, v in valid_data_c.items() if v > 2}))
print('BAD users:', len(invalid_data-valid_data) +
      len({k for k, v in valid_data_c.items() if v <= 2}))


# valid_data_d = Counter([x.uid for x in data if not x.invalid])
valid_data_c = {k: v for k, v in valid_data_c.items() if v > 2}
print('Average ok stimuli finished', sum(valid_data_c.values())/len(valid_data_c))
