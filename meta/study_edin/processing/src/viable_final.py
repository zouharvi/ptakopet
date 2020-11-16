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
import re
import sys

def extract_viable_scores(data, viable_attr, changetype_filter=None):
    g1 = []
    g2 = []
    g3 = []
    g4 = []
    g5 = []
    for segment in data:
        for qalog in getattr(segment, viable_attr):
            if changetype_filter is not None and hasattr(qalog, "changetype") and re.fullmatch(changetype_filter, qalog.changetype) is None:
                #print("CHNGTYPE: {:s}".format(qalog.changetype if hasattr(qalog, "changetype") else "None"), file=sys.stderr)
                continue
            if changetype_filter is not None:
                print("CHNGTYPE: '{:s}'".format(qalog.changetype if hasattr(qalog, "changetype") else "None"), file=sys.stderr)
            g1.append(qalog.src_sti_adq)
            g2.append(qalog.tgt_src_adq)
            g3.append(qalog.tgt_sti_adq)
            g4.append(qalog.tgt_flu)
            g5.append(qalog.overall)
    print("G size: {:d}".format(len(g1)), file=sys.stderr)
    return [np.average([x for x in g if x is not None]) for g in [g1, g2, g3, g4, g5]]


parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('--pdf', type=str, help='Instead of showing, print to the specified PDF file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [
    x for x in data if
    (len(x.grade_f) != 0) and
    not x.invalid
]

vgs = extract_viable_scores(data, "grade_v")
fgs = extract_viable_scores(data, "grade_f")
cvgs = extract_viable_scores(data, "grade_v", r"^[^X]*$")
dff = [y-x for (x,y) in zip(vgs, fgs)]

OFFSETX = 0.15
fig = plt.figure(figsize=(4.2, 3.2))
ax1 = fig.add_subplot()
vh = ax1.plot(range(5), vgs, markersize=8, marker='s', color='darkblue', alpha=0.6)
fh = ax1.plot(range(5), fgs, markersize=8, marker='v', color='darkgreen', alpha=0.6)
cvh = ax1.plot(range(5), cvgs, markersize=8, marker='o', color='darkorange', alpha=0.6)
ax1.set_ylim(4, 4.7)
ax1.set_xticks(range(5))
ax1.set_xticklabels(['SRC-STI', 'TGT-SRC', 'TGT-STI', 'Fluency', 'Overall'])
ax1.set_ylabel('Score')

ax2 = ax1.twinx()
dh = ax2.plot(range(5), dff, markersize=14, marker='.', color='darkred', alpha=0.6, linestyle='--')
ax2.set_ylim(0, 0.15)
ax2.set_ylabel('Difference')

plt.legend(
    vh+fh+cvh+dh,
    ['Viables', 'Final', 'Correct viables', 'Final-Viables'],
    loc='upper right',
    ncol=1,
)
fig.tight_layout(rect=[-0.03, -0.02, 1.01, 1.03])
plt.show()

if args.pdf is not None:
    fig.savefig(args.pdf)
