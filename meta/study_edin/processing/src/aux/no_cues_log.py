#!/usr/bin/env python3

import pickle
import argparse
import numpy as np
import re

SCORE_NAMES = ["src_sti_adq", "tgt_src_adq", "tgt_sti_adq", "tgt_flu", "overall"]

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('--pdf', type=str, help='Instead of showing, print to the specified PDF file')
parser.add_argument('--pairs-only', action="store_true", help='Calculate only from pairs of viable and final evaluated by the same annotator')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [
    x for x in data if
    (len(x.grade_f) != 0) and
    not x.invalid
]

print("All segments: {:d}".format(len(data)))

data = [ x for x in data if not x.cid.bt and x.cid.qe and x.cid.pp ]
print("BT only segments: {:d}".format(len(data)))

data = [ x for x in data if any([x.grade_f[0].src != v.src for v in x.grade_v]) ]
print("With intermediate viables: {:d}".format(len(data)))

data = [ x for x in data if any([v.changetype != "X" for v in x.grade_v if hasattr(v, "changetype")]) ]
print("That are not erroneous: {:d}".format(len(data)))

lines = []
for segment in data:
    f_scores = []
    for f in segment.grade_f:
        f_scores.append([getattr(f, sn) for sn in SCORE_NAMES])
    avg_f_scores = np.nanmean(np.array(f_scores, dtype=float), axis=0)
    v_scores = {}
    v_tgt = {}
    v_changetypes = {}
    for v in segment.grade_v:
        if v.src != f.src:
            if re.match(r"(X|PM)", v.changetype):
                continue
            v_scores.setdefault(v.src, []).append([getattr(v, sn) for sn in SCORE_NAMES])
            v_tgt[v.src] = v.tgt
            v_changetypes[v.src] = v.changetype
    for vsrc in v_scores:
        avg_v_scores = np.nanmean(np.array(v_scores[vsrc], dtype=float), axis=0)
        diff_scores = avg_f_scores - avg_v_scores
        lines.append([diff_scores[4], v_changetypes[vsrc], " ".join([f"{x:.2f}" for x in diff_scores.tolist()]), vsrc, v_tgt[vsrc], segment.grade_f[0].src, segment.grade_f[0].tgt])

slines = sorted(lines, key=lambda x: x[0], reverse=True)
for line in slines:
    print("\t".join(line[1:]))
