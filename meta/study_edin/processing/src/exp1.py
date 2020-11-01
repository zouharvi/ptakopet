#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from collections import Counter
from random import shuffle
from functools import reduce
import matplotlib.pyplot as plt
import numpy as np

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [x for x in data if hasattr(x, 'score') and not x.invalid]
d_req = {}
d_tim = {}
d_lin = {}
d_inc = {}

for segment in data:
    texts = [s[2] for s in segment.data if s[0] == 'TRANSLATE1']
    texts_len = [len(s[2]) for s in segment.data if s[0] == 'TRANSLATE1']
    if len(texts) != 0:
        d_req.setdefault(segment.score, []).append(len(texts))
        time = float(segment.data[-1][1])-float(segment.data[0][1])
        if time <= 6*60*1000:
            d_tim.setdefault(segment.score, []).append(time/1000)

    linear = reduce(
        lambda a, b: (
            a[0] and (a[1] in b), b
        ),
        texts,
        (True, '')
    )[0]
    d_lin.setdefault(segment.score, []).append(linear)

    increasing = reduce(lambda a, b: (
        a[0] and (len(a[1]) <= len(b)), b), texts, (True, ''))[0]
    d_inc.setdefault(segment.score, []).append(increasing)

OFFSET = 0.07
d_req = {(k+OFFSET): np.average(v) for (k, v) in d_req.items()}
d_tim = {(k-OFFSET): np.average(v) for (k, v) in d_tim.items()}

# display plot

fig, ax1 = plt.subplots()
color = 'darkgreen'
ax1.set_xlabel('confidence')
ax1.set_ylabel('time (s)', color=color)
ax1.tick_params(axis='y', labelcolor=color)
ax1.scatter(list(d_tim.keys()), list(d_tim.values()), color=color)


ax2 = ax1.twinx() 
color = 'red'
ax2.set_xlabel('confidence')
ax2.set_ylabel('requests', color=color)
ax2.tick_params(axis='y', labelcolor=color)
ax2.scatter(list(d_req.keys()), list(d_req.values()), color=color)

fig.tight_layout()
plt.show()
# print(Counter(requests))
# print(Counter(linears))
# print(Counter(increasings))
