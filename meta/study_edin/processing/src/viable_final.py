#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog
from collections import Counter
from random import shuffle
from functools import reduce
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import MaxNLocator

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [
    x for x in data if
    (len(x.grade_f) != 0) and
    not x.invalid
]

vg1 = []
vg2 = []
vg3 = []
vg4 = []
vg5 = []
fg1 = []
fg2 = []
fg3 = []
fg4 = []
fg5 = []

for segment in data:
    for qalog in segment.grade_v:
        vg1.append(qalog.src_sti_adq)
        vg2.append(qalog.tgt_src_adq)
        vg3.append(qalog.tgt_sti_adq)
        vg4.append(qalog.tgt_flu)
        vg5.append(qalog.overall)
    for qalog in segment.grade_f:
        fg1.append(qalog.src_sti_adq)
        fg2.append(qalog.tgt_src_adq)
        fg3.append(qalog.tgt_sti_adq)
        fg4.append(qalog.tgt_flu)
        fg5.append(qalog.overall)

vg1 = np.average([x for x in vg1 if x is not None])
vg2 = np.average([x for x in vg2 if x is not None])
vg3 = np.average([x for x in vg3 if x is not None])
vg4 = np.average([x for x in vg4 if x is not None])
vg5 = np.average([x for x in vg5 if x is not None])
fg1 = np.average([x for x in fg1 if x is not None])
fg2 = np.average([x for x in fg2 if x is not None])
fg3 = np.average([x for x in fg3 if x is not None])
fg4 = np.average([x for x in fg4 if x is not None])
fg5 = np.average([x for x in fg5 if x is not None])

vgs = [vg1, vg2, vg3, vg4, vg5]
fgs = [fg1, fg2, fg3, fg4, fg5]
dff = [y-x for (x,y) in zip(vgs, fgs)]

OFFSETX = 0.15
fig = plt.figure(figsize=(4.2, 3.2))
ax1 = fig.add_subplot()
vh = ax1.plot(range(5), vgs, markersize=8, marker='s', color='darkblue', alpha=0.6)
fh = ax1.plot(range(5), fgs, markersize=8, marker='v', color='darkgreen', alpha=0.6)
ax1.set_ylim(4, 4.7)
ax1.set_xticks(range(5))
ax1.set_xticklabels(['SRC-STI', 'TGT-SRC', 'TGT-STI', 'Fluency', 'Overall'])
ax1.set_ylabel('Score')

ax2 = ax1.twinx()
dh = ax2.plot(range(5), dff, markersize=14, marker='.', color='darkred', alpha=0.6, linestyle='--')
ax2.set_ylabel('Difference')

plt.legend(
    vh+fh+dh,
    ['Viables', 'Final', 'Final-Viables'],
    loc='upper center',
    bbox_to_anchor=(0.5, 1.2),
    ncol=3,
)
fig.tight_layout(rect=[-0.03, -0.02, 1.01, 1.03])
plt.show()