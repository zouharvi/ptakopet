#!/usr/bin/env python3

import sys
from collections import Counter

with open(sys.argv[1], 'r') as f:
    data = [x.rstrip('\n').split(',') for x in f.readlines()]

buckets = {}
keys_yn = ['ft', 'bt', 'pp', 'qe']
keys_lang = ['cs', 'csw', 'et']

print('Histogram:')
counter = Counter([int(x[1]) for x in data])
print(sorted(counter.items()))


for esid, value in data:
    value = int(value)

    for key in keys_yn:
        if key+'.y' in esid:
            buckets.setdefault(key+'.y', []).append(value)
        if key+'.n' in esid:
            buckets.setdefault(key+'.n', []).append(value)
    for key in keys_lang:
        if esid.endswith(key):
            buckets.setdefault(key, []).append(value)


bucketsAvgSorted = {k: v for k, v in sorted(buckets.items(), key=lambda item: sum(item[1])/len(item[1]))}

print('\nPiece-wise results:')
for key, item in bucketsAvgSorted.items():
    avg = sum(item)/len(item)
    print(f'{key.rjust(5)}: {avg:1.2f}')


buckets = {}
for esid, value in data:
    value = int(value)
    buckets.setdefault(esid, []).append(value)

bucketsAvgSorted = {k: v for k, v in sorted(buckets.items(), key=lambda item: sum(item[1])/len(item[1]))}

print('\nComplex results:')
for key, item in bucketsAvgSorted.items():
    avg = sum(item)/len(item)
    print(f'{key.rjust(24)}: {avg:1.2f}')