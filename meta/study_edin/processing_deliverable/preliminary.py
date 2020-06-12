#!/usr/bin/env python3

import sys
from collections import Counter
import argparse
import pickle
import re
from load import Segment, CID

parser = argparse.ArgumentParser(description='Preliminary log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('--filter', type=int, default=0, help='Which filter to use')
args = parser.parse_args()

buckets = {}
keys_yn = ['ft', 'bt', 'pp', 'qe']
keys_lang = ['cs', 'csw', 'et']

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

if args.filter == 1:
    # "No Czech knowledge people || Estonian model"
    knows_czech = ['legend', 'romaine', 'strain']
    data = list(filter(lambda x: (not x.uid in knows_czech) or (x.cid.engine == 'et'), data))
elif args.filter == 2:
    # "Some Czech knowledge && Czech Model"
    knows_czech = ['legend', 'romaine', 'strain']
    data = list(filter(lambda x: x.uid in knows_czech and (x.cid.engine in ['cs', 'csw']), data))

print('Rating histogram:')
counter = Counter([x.score for x in filter(lambda x: x.success, data)])
print(sorted(counter.items()))

for segment in data:
    if not segment.success:
        continue
    score = int(segment.score)

    if segment.cid.ft:
        buckets.setdefault('ft.y', []).append(score)
    else:
        buckets.setdefault('ft.n', []).append(score)

    if segment.cid.bt:
        buckets.setdefault('bt.y', []).append(score)
    else:
        buckets.setdefault('bt.n', []).append(score)

    if segment.cid.pp:
        buckets.setdefault('pp.y', []).append(score)
    else:
        buckets.setdefault('pp.n', []).append(score)

    if segment.cid.qe:
        buckets.setdefault('qe.y', []).append(score)
    else:
        buckets.setdefault('qe.n', []).append(score)

    buckets.setdefault(segment.cid.engine, []).append(score)

bucketsAvgSorted = {k: v for k, v in sorted(buckets.items(), key=lambda item: sum(item[1])/len(item[1]))}

print('\nPiece-wise results:')
for key, item in bucketsAvgSorted.items():
    avg = sum(item)/len(item)
    print(f'{key.rjust(5)}: {avg:1.2f}')


buckets = {}
for segment in data:
    if segment.success:
        buckets.setdefault(segment.cid.__str__(), []).append(segment.score)

bucketsAvgSorted = {k: v for k, v in sorted(buckets.items(), key=lambda item: sum(item[1])/len(item[1]))}

print('\nComplex results:')
for key, item in bucketsAvgSorted.items():
    avg = sum(item)/len(item)
    print(f'{key.rjust(24)}: {avg:1.2f}')