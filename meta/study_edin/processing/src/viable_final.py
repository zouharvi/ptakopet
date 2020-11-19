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
from scipy.stats import wilcoxon

SCORE_NAMES = ["src_sti_adq", "tgt_src_adq", "tgt_sti_adq", "tgt_flu", "overall"]

def avg_viable_scores(viables):
    gs = [[getattr(v, sn) for v in viables] for sn in SCORE_NAMES]
    return [np.average([x for x in g if x is not None]) for g in gs]
    
def extract_viable_final_score_pairs(vl, fl):
    pairs = []
    for v in vl:
        for f in fl:
            if v.user == f.user:
                pairs.append((
                    [ getattr(v, sn) for sn in SCORE_NAMES ],
                    [ getattr(f, sn) for sn in SCORE_NAMES ],
                    v.changetype if hasattr(v, "changetype") else None
                ))
    return pairs

def group_by_src(viables):
    groups = {}
    for x in viables:
        if x.src not in groups:
            groups[x.src] = []
        groups[x.src].append(x)
    return groups.values()

def aggregate_viable_final_scores(data, pairs_only=False):
    vfc_list = []
    for segment in data:
        v_groups = group_by_src(segment.grade_v)
        f = avg_viable_scores(segment.grade_f)
        for vg in v_groups:
            if pairs_only:
                vfc_list.extend(extract_viable_final_score_pairs(vg, segment.grade_f))
            else:
                v = avg_viable_scores(vg)
                c = vg[0].changetype if hasattr(vg[0], "changetype") else None
                vfc_list.append((v, f, c))
    return vfc_list


def calculate_plots(vfc):
    v_matrix = np.array([v for v, f, c in vfc], dtype=np.float)
    f_matrix = np.array([f for v, f, c in vfc], dtype=np.float)
    diff_matrix = np.array([np.array(f, dtype=np.float) - np.array(v, dtype=np.float) for v, f, c in vfc])
    wilcx_res = np.apply_along_axis(lambda x: wilcoxon(x, alternative="greater", zero_method="zsplit"), 0, diff_matrix)
    vgs = np.nanmean(v_matrix, axis=0)
    fgs = np.nanmean(f_matrix, axis=0)
    dff = np.nanmean(diff_matrix, axis=0)
    return vgs, fgs, dff, wilcx_res[1]


def type_plots(vgs, fgs, dff, pvals, header, vfc):
    print(header)
    print("C:\t" + str(len(vfc)))
    print("V:\t" + str(vgs))
    print("F:\t" + str(fgs))
    print("F-V:\t" + str(dff))
    print("PV:\t" + str(["{:.3f}".format(v) for v in pvals]))


parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('--pdf', type=str, help='Instead of showing, print to the specified PDF file')
parser.add_argument('--pairs-only', action="store_true", help='Calculate only from pairs of viable and final evaluated by the same annotator')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

print(len(data))

data = [
    x for x in data if
    (len(x.grade_f) != 0) and
    not x.invalid
]

print(len(data))

vfc = aggregate_viable_final_scores(data, args.pairs_only)
vgs, fgs, dff, pvals = calculate_plots(vfc)
type_plots(vgs, fgs, dff, pvals, "========= All viable-final pairs ========", vfc)

vfc = [vfc_i for vfc_i in vfc if vfc_i[2] is not None]
vgs, fgs, dff, pvals = calculate_plots(vfc)
type_plots(vgs, fgs, dff, pvals, "========= * viable<>final pairs ========", vfc)

vfc_X = [vfc_i for vfc_i in vfc if re.match(r"X", vfc_i[2])]
vgs, fgs, dff, pvals = calculate_plots(vfc_X)
type_plots(vgs, fgs, dff, pvals, "========= * X pairs ========", vfc_X)

vfc_PM = [vfc_i for vfc_i in vfc if re.match(r"PM", vfc_i[2])]
vgs, fgs, dff, pvals = calculate_plots(vfc_PM)
type_plots(vgs, fgs, dff, pvals, "========= * PM pairs ========", vfc_PM)

vfc_noXPM = [vfc_i for vfc_i in vfc if not re.match(r"X", vfc_i[2]) and not re.match(r"PM", vfc_i[2])]
vgs_noXPM, fgs_noXPM, dff_noXPM, pvals = calculate_plots(vfc_noXPM)
type_plots(vgs_noXPM, fgs_noXPM, dff_noXPM, pvals, "========= * not (X or PM) pairs ========", vfc_noXPM)

vfc_P = [vfc_i for vfc_i in vfc_noXPM if re.match(r"P", vfc_i[2])]
vgs, fgs, dff, pvals = calculate_plots(vfc_P)
type_plots(vgs, fgs, dff, pvals, "========= * P pairs ========", vfc_P)

vfc_PG = [vfc_i for vfc_i in vfc_noXPM if re.match(r"PG", vfc_i[2])]
vgs, fgs, dff, pvals = calculate_plots(vfc_PG)
type_plots(vgs, fgs, dff, pvals, "========= * PG pairs ========", vfc_PG)

vfc_PnotG = [vfc_i for vfc_i in vfc_P if not re.match(r"PG", vfc_i[2])]
vgs, fgs, dff, pvals = calculate_plots(vfc_PnotG)
type_plots(vgs, fgs, dff, pvals, "========= * P-PG pairs ========", vfc_PnotG)

vfc_Q = [vfc_i for vfc_i in vfc_noXPM if re.match(r"Q", vfc_i[2])]
vgs, fgs, dff, pvals = calculate_plots(vfc_Q)
type_plots(vgs, fgs, dff, pvals, "========= * Q pairs ========", vfc_Q)

# exit()

OFFSETX = 0.15
fig = plt.figure(figsize=(4.2, 3.2))
ax1 = fig.add_subplot()
vh = ax1.plot(range(5), vgs_noXPM, markersize=8, marker='s', color='darkblue', alpha=0.6)
fh = ax1.plot(range(5), fgs_noXPM, markersize=8, marker='v', color='darkgreen', alpha=0.6)
ax1.set_ylim(3.9, 4.5)
ax1.set_xticks(range(5))
ax1.set_xticklabels(['SRC-STI', 'TGT-SRC', 'TGT-STI', 'Fluency', 'Overall'])
ax1.set_ylabel('Score')

ax2 = ax1.twinx()
dh = ax2.plot(range(5), dff_noXPM, markersize=14, marker='.', color='darkred', alpha=0.6, linestyle='--')
ax2.set_ylim(-0.15, 0.15)
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
