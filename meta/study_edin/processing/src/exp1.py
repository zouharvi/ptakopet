#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from collections import Counter
from random import shuffle
from functools import reduce
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import MaxNLocator

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
d_len = {}

for segment in data:
    texts = [s[2] for s in segment.data if s[0] == 'TRANSLATE1']
    texts_len = [len(s[2]) for s in segment.data if s[0] == 'TRANSLATE1']

    if len(texts) != 0:
        d_req.setdefault(segment.score, []).append(len(texts))
        time = float(segment.data[-1][1])-float(segment.data[0][1])
        d_len.setdefault(segment.score, []).append(np.average(texts_len))
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
SCORES = [x for x in range(1,5+1)]
d_req = {k: np.average(v) for (k, v) in d_req.items()}
d_tim = {k: np.average(v) for (k, v) in d_tim.items()}
d_len = {k: np.average(v) for (k, v) in d_len.items()}

# display plot
plt.rcParams.update({'font.size': 14})

fig = plt.figure(figsize=(10, 4.5))

ax1 = fig.add_subplot()
color = 'darkgreen'
ax1.set_xlabel('Self-reported user confidence')
ax1.set_ylabel('Source text length (char)', color=color)
ax1.tick_params(axis='y', labelcolor=color)
sc1 = ax1.plot(
    [str(x) for x in SCORES],
    [d_len[k] for k in SCORES],
    color=color, label='Source text length',
    markersize=10, marker='o',
    alpha=0.6
)
ax1.yaxis.set_major_locator(MaxNLocator(5))

ax2 = ax1.twinx()
color = 'red'
ax2.set_ylabel('Requests', color=color)
ax2.tick_params(axis='y', labelcolor=color)
sc2 = ax2.plot(
    [str(x) for x in SCORES],
    [d_req[k] for k in SCORES],
    color=color, label='Requests',
    markersize=10, marker='v',
    alpha=0.6
)
ax2.yaxis.set_major_locator(MaxNLocator(5))

ax3 = ax1.twinx()
color = 'blue'
ax3.set_ylabel('Time (s)', color=color)
ax3.tick_params(axis='y', labelcolor=color)
sc3 = ax3.plot(
    [str(x) for x in SCORES],
    [d_tim[k] for k in SCORES],
    color=color, label='Time',
    markersize=10, marker='s',
    alpha=0.6
)
ax3.spines['right'].set_position(('outward', 60))
ax3.yaxis.set_major_locator(MaxNLocator(5, min_n_ticks=5))


# legend
lns = sc1+sc2+sc3
plt.legend(handles=lns, labels=[l.get_label() for l in lns],
           loc='upper center',
           fancybox=True,
           bbox_to_anchor=(0.5, 1.18),
           ncol=3)


fig.tight_layout(rect=[0, 0, 1, 1])

plt.show()
# print(Counter(requests))
# print(Counter(linears))
# print(Counter(increasings))
