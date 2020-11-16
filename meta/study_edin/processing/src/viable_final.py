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
from pprint import pprint

def avg_viable_scores(viables):
    g1 = []
    g2 = []
    g3 = []
    g4 = []
    g5 = []
    for v in viables:
        g1.append(v.src_sti_adq)
        g2.append(v.tgt_src_adq)
        g3.append(v.tgt_sti_adq)
        g4.append(v.tgt_flu)
        g5.append(v.overall)
    return [np.average([x for x in g if x is not None]) for g in [g1, g2, g3, g4, g5]]
    

def group_by_src(viables):
    groups = {}
    for x in viables:
        if x.src not in groups:
            groups[x.src] = []
        groups[x.src].append(x)
    return groups.values()

def aggregate_viable_final_scores(data):
    vfc_list = []
    for segment in data:
        v_groups = group_by_src(segment.grade_v)
        f = avg_viable_scores(segment.grade_f)
        for vg in v_groups:
            v = avg_viable_scores(vg)
            c = vg[0].changetype if hasattr(vg[0], "changetype") else None
            vfc_list.append((v, f, c))
    return vfc_list

def calculate_plots(vfc):
    v_matrix = np.array([v for v, f, c in vfc])
    f_matrix = np.array([f for v, f, c in vfc])
    diff_matrix = np.array([np.array(f) - np.array(v) for v, f, c in vfc])
    vgs = np.mean(v_matrix, axis=0)
    fgs = np.mean(f_matrix, axis=0)
    dff = np.mean(diff_matrix, axis=0)
    return vgs, fgs, dff


def type_plots(vgs, fgs, dff, header, vfc):
    print(header)
    print("C:\t" + str(len(vfc)))
    print("V:\t" + str(vgs))
    print("F:\t " + str(fgs))
    print("F-V:\t " + str(dff))


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

vfc = aggregate_viable_final_scores(data)
vgs, fgs, dff = calculate_plots(vfc)
type_plots(vgs, fgs, dff, "========= All viable-final pairs ========", vfc)

vfc = [vfc_i for vfc_i in vfc if vfc_i[2] is not None]
vgs, fgs, dff = calculate_plots(vfc)
type_plots(vgs, fgs, dff, "========= * viable<>final pairs ========", vfc)

vfc_X = [vfc_i for vfc_i in vfc if re.match(r"X", vfc_i[2])]
vgs, fgs, dff = calculate_plots(vfc_X)
type_plots(vgs, fgs, dff, "========= * X pairs ========", vfc_X)

vfc_PM = [vfc_i for vfc_i in vfc if re.match(r"PM", vfc_i[2])]
vgs, fgs, dff = calculate_plots(vfc_PM)
type_plots(vgs, fgs, dff, "========= * PM pairs ========", vfc_PM)

vfc_noXPM = [vfc_i for vfc_i in vfc if not re.match(r"X", vfc_i[2]) and not re.match(r"PM", vfc_i[2])]
vgs, fgs, dff = calculate_plots(vfc_noXPM)
type_plots(vgs, fgs, dff, "========= * not (X or PM) pairs ========", vfc_noXPM)

vfc_P = [vfc_i for vfc_i in vfc_noXPM if re.match(r"P", vfc_i[2])]
vgs, fgs, dff = calculate_plots(vfc_P)
type_plots(vgs, fgs, dff, "========= * P pairs ========", vfc_P)

vfc_PG = [vfc_i for vfc_i in vfc_noXPM if re.match(r"PG", vfc_i[2])]
vgs, fgs, dff = calculate_plots(vfc_PG)
type_plots(vgs, fgs, dff, "========= * PG pairs ========", vfc_PG)

vfc_PnotG = [vfc_i for vfc_i in vfc_P if not re.match(r"PG", vfc_i[2])]
vgs, fgs, dff = calculate_plots(vfc_PnotG)
type_plots(vgs, fgs, dff, "========= * P-PG pairs ========", vfc_PnotG)

vfc_Q = [vfc_i for vfc_i in vfc_noXPM if re.match(r"Q", vfc_i[2])]
vgs, fgs, dff = calculate_plots(vfc_Q)
type_plots(vgs, fgs, dff, "========= * Q pairs ========", vfc_Q)

# exit()

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
ax2.set_ylim(0, 0.15)
ax2.set_ylabel('Difference')

plt.legend(
    vh+fh+dh,
    ['Viables', 'Final', 'Final-Viables'],
    loc='upper right',
    ncol=1,
)
fig.tight_layout(rect=[-0.03, -0.02, 1.01, 1.03])
plt.show()

if args.pdf is not None:
    fig.savefig(args.pdf)
