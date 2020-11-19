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
from scipy.stats import wilcoxon, mannwhitneyu

SCORE_NAMES = ["src_sti_adq", "tgt_src_adq", "tgt_sti_adq", "tgt_flu", "overall"]

def avg_viable_scores(viables):
    gs = [[getattr(v, sn) for v in viables] for sn in SCORE_NAMES]
    return [np.average([x for x in g if x is not None]) for g in gs]
    
def extract_viable_final_score_pairs(vl, fl, cid=None):
    pairs = []
    for v in vl:
        for f in fl:
            if v.user == f.user:
                pairs.append((
                    [ getattr(v, sn) for sn in SCORE_NAMES ],
                    [ getattr(f, sn) for sn in SCORE_NAMES ],
                    v.changetype if hasattr(v, "changetype") else None,
                    cid
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
    if pairs_only:
        vfc_list = []
        for segment in data:
            v_groups = group_by_src(segment.grade_v)
            f = avg_viable_scores(segment.grade_f)
            for vg in v_groups:
                vfc_list.extend(extract_viable_final_score_pairs(vg, segment.grade_f, segment.cid))
        return vfc_list
    else:
        v_list = []
        f_list = []
        for segment in data:
            all_changetypes_str = " ".join([v.changetype for v in segment.grade_v if hasattr(v, "changetype")])
            v_list.extend([([getattr(v, sn) for sn in SCORE_NAMES], v.changetype if hasattr(v, "changetype") else None, segment.cid) for v in segment.grade_v])
            f_list.extend([([getattr(f, sn) for sn in SCORE_NAMES], all_changetypes_str, segment.cid) for f in segment.grade_f])
        return (v_list, f_list)

def filter_vfc(vfc, changetype_filter=None, config_filter=None):
    if type(vfc) is list:
        vfc = [vfc_i for vfc_i in vfc if (changetype_filter is None or changetype_filter(vfc_i[2])) and (config_filter is None or config_filter(vfc_i[3]))]
    else:
        v_list = [v_i for v_i in vfc[0] if (changetype_filter is None or changetype_filter(v_i[1])) and (config_filter is None or config_filter(v_i[2]))]
        f_list = [f_i for f_i in vfc[1] if (changetype_filter is None or changetype_filter(f_i[1])) and (config_filter is None or config_filter(f_i[2]))]
        vfc = (v_list, f_list)
    return vfc

def calculate_plots(vfc):
    if type(vfc) is list:
        v_matrix = np.array([v for v, f, ct, cid in vfc], dtype=np.float)
        f_matrix = np.array([f for v, f, ct, cid in vfc], dtype=np.float)
        diff_matrix = np.array([np.array(f, dtype=np.float) - np.array(v, dtype=np.float) for v, f, ct, cid in vfc])
        test_res = np.apply_along_axis(lambda x: wilcoxon(x, alternative="two-sided", zero_method="zsplit"), 0, diff_matrix)
        vgs = np.nanmean(v_matrix, axis=0)
        fgs = np.nanmean(f_matrix, axis=0)
        dff = np.nanmean(diff_matrix, axis=0)
    else:
        v_matrix = np.array([v for v, ct, cid in vfc[0]], dtype=np.float)
        f_matrix = np.array([f for f, ct, cid in vfc[1]], dtype=np.float)
        vgs = np.nanmean(v_matrix, axis=0)
        fgs = np.nanmean(f_matrix, axis=0)
        dff = fgs - vgs
        test_res = np.transpose(np.array([ np.array(mannwhitneyu(v_matrix[:,i], f_matrix[:,i], alternative="two-sided")) for i in range(v_matrix.shape[1])]))
    return vgs, fgs, dff, test_res[1]


def type_plots(vgs, fgs, dff, pvals, header, vfc):
    print(header, file=sys.stderr)
    if type(vfc) is list:
        print("C:\t" + str(len(vfc)), file=sys.stderr)
    else:
        print("C: {:d}, {:d}\t".format(len(vfc[0]), len(vfc[1])), file=sys.stderr)
    print("V:\t" + str(vgs), file=sys.stderr)
    print("F:\t" + str(fgs), file=sys.stderr)
    print("F-V:\t" + str(dff), file=sys.stderr)
    print("PV:\t" + str(["{:.3f}".format(v) for v in pvals]), file=sys.stderr)

def print_tab_line(dff, pvals, title):
    linestr = " & ".join([title] + ["{:.2f}".format(df_val) for df_val in dff])
    linestr += " \\\\"
    print(linestr)
    


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

vfc = aggregate_viable_final_scores(data, args.pairs_only)
vgs, fgs, dff, pvals = calculate_plots(vfc)
type_plots(vgs, fgs, dff, pvals, "========= All viable-final pairs ========", vfc)

vfc = filter_vfc(vfc, changetype_filter=lambda x: x is not None)
vgs, fgs, dff, pvals = calculate_plots(vfc)
type_plots(vgs, fgs, dff, pvals, "========= * viable<>final pairs ========", vfc)

vfc_X = filter_vfc(vfc, changetype_filter=lambda x: re.match(r"X", x))
vgs, fgs, dff, pvals = calculate_plots(vfc_X)
type_plots(vgs, fgs, dff, pvals, "========= * X pairs ========", vfc_X)

vfc_PM = filter_vfc(vfc, changetype_filter=lambda x: re.match(r"PM", x))
vgs, fgs, dff, pvals = calculate_plots(vfc_PM)
type_plots(vgs, fgs, dff, pvals, "========= * PM pairs ========", vfc_PM)

vfc_noXPM = filter_vfc(vfc, changetype_filter=lambda x: not re.match(r"X", x) and not re.match(r"PM", x))
vgs_noXPM, fgs_noXPM, dff_noXPM, pvals_noXPM = calculate_plots(vfc_noXPM)
type_plots(vgs_noXPM, fgs_noXPM, dff_noXPM, pvals_noXPM, "========= * not (X or PM) pairs ========", vfc_noXPM)

print(file=sys.stderr)
print("#########################################################################", file=sys.stderr)
print(file=sys.stderr)

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: x.engine == "csw")
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * CSW segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "Czech MT 1")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: x.engine == "cs")
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * CS segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "Czech MT 2")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: x.engine == "css")
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * CSS segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "Czech MT 3")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: x.engine == "et")
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * ET segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "Estonian")

print("\\hline")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: x.bt and x.qe and x.pp)
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * BT QE PP segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "BT QE PP")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: x.bt and x.qe and not x.pp)
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * BT QE segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "BT QE")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: x.bt and not x.qe and x.pp)
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * BT PP segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "BT PP")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: not x.bt and x.qe and x.pp)
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * QE PP segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "QE PP")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: x.bt and not x.qe and not x.pp)
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * BT segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "BT")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: not x.bt and x.qe and not x.pp)
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * QE segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "QE")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: not x.bt and not x.qe and x.pp)
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * PP segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "PP")

vfc_line = filter_vfc(vfc_noXPM, config_filter=lambda x: not x.bt and not x.qe and not x.pp)
vgs_line, fgs_line, dff_line, pvals_line = calculate_plots(vfc_line)
type_plots(vgs_line, fgs_line, dff_line, pvals_line, "========= * - segments ========", vfc_line)
print_tab_line(dff_line, pvals_line, "--")

print("\\hline")

print_tab_line(dff_noXPM, pvals_noXPM, "Total")

vfc_qe_all = filter_vfc(vfc_noXPM, config_filter=lambda x: x.qe)
vgs, fgs, dff, pvals = calculate_plots(vfc_qe_all)
type_plots(vgs, fgs, dff, pvals, "========= * not (X or PM) pairs, all QE segments ========", vfc_qe_all)


vfc_P = filter_vfc(vfc_noXPM, changetype_filter=lambda x: re.match(r"P", x))
vgs, fgs, dff, pvals = calculate_plots(vfc_P)
type_plots(vgs, fgs, dff, pvals, "========= * P pairs ========", vfc_P)

vfc_PG = filter_vfc(vfc_noXPM, changetype_filter=lambda x: re.match(r"PG", x))
vgs, fgs, dff_PG, pvals = calculate_plots(vfc_PG)
type_plots(vgs, fgs, dff_PG, pvals, "========= * PG pairs ========", vfc_PG)

vfc_PnotG = filter_vfc(vfc_P, changetype_filter=lambda x: not re.match(r"PG", x))
vgs, fgs, dff_PnotG, pvals = calculate_plots(vfc_PnotG)
type_plots(vgs, fgs, dff_PnotG, pvals, "========= * P-PG pairs ========", vfc_PnotG)

vfc_Q = filter_vfc(vfc_noXPM, changetype_filter=lambda x: re.match(r"Q", x))
vgs, fgs, dff_Q, pvals = calculate_plots(vfc_Q)
type_plots(vgs, fgs, dff_Q, pvals, "========= * Q pairs ========", vfc_Q)

print(file=sys.stderr)
print("#########################################################################", file=sys.stderr)
print(file=sys.stderr)


vfc_qe_all = filter_vfc(vfc_noXPM, config_filter=lambda x: x.qe)
vgs, fgs, dff, pvals = calculate_plots(vfc_qe_all)
type_plots(vgs, fgs, dff, pvals, "========= * not (X or PM) pairs, all QE segments ========", vfc_qe_all)

vfc_pp_all = filter_vfc(vfc_noXPM, config_filter=lambda x: x.pp)
vgs, fgs, dff, pvals = calculate_plots(vfc_pp_all)
type_plots(vgs, fgs, dff, pvals, "========= * not (X or PM) pairs, all PP segments ========", vfc_pp_all)

vfc_bt_all = filter_vfc(vfc_noXPM, config_filter=lambda x: x.bt)
vgs, fgs, dff, pvals = calculate_plots(vfc_bt_all)
type_plots(vgs, fgs, dff, pvals, "========= * not (X or PM) pairs, BT segments ========", vfc_bt_all)

vfc_bt_nqe = filter_vfc(vfc_noXPM, config_filter=lambda x: x.bt and not x.qe)
vgs, fgs, dff, pvals = calculate_plots(vfc_bt_nqe)
type_plots(vgs, fgs, dff, pvals, "========= * not (X or PM) pairs, BT and not QE segments ========", vfc_bt_nqe)

vfc_bt_npp = filter_vfc(vfc_noXPM, config_filter=lambda x: x.bt and not x.pp)
vgs, fgs, dff, pvals = calculate_plots(vfc_bt_npp)
type_plots(vgs, fgs, dff, pvals, "========= * not (X or PM) pairs, BT and not PP segments ========", vfc_bt_npp)

vfc_bt_nqe_pp = filter_vfc(vfc_noXPM, config_filter=lambda x: x.bt and not x.qe and x.pp)
vgs, fgs, dff, pvals = calculate_plots(vfc_bt_nqe_pp)
type_plots(vgs, fgs, dff, pvals, "========= * not (X or PM) pairs, BT and PP and not QE segments ========", vfc_bt_nqe_pp)

vfc_bt_nqe_npp = filter_vfc(vfc_noXPM, config_filter=lambda x: x.bt and not x.qe and not x.pp)
vgs, fgs, dff, pvals = calculate_plots(vfc_bt_nqe_npp)
type_plots(vgs, fgs, dff, pvals, "========= * not (X or PM) pairs, BT and not QE and not PP segments ========", vfc_bt_nqe_npp)

OFFSETX = 0.15
fig = plt.figure(figsize=(4.2, 3.2))
ax1 = fig.add_subplot()
noXPM_p = ax1.plot(range(5), dff_noXPM, markersize=8, marker='s', color='darkblue', alpha=0.6)
Q_p = ax1.plot(range(5), dff_Q, markersize=8, marker='v', color='darkgreen', alpha=0.6)
PG_p = ax1.plot(range(5), dff_PG, markersize=14, marker='.', color='darkred', alpha=0.6, linestyle='--')
PnotG_p = ax1.plot(range(5), dff_PnotG, markersize=8, marker='v', color='darkorange', alpha=0.6)
#ax1.set_ylim(3.9, 4.5)
ax1.set_xticks(range(5))
ax1.set_xticklabels(['SRC-STI', 'TGT-SRC', 'TGT-STI', 'Fluency', 'Overall'])
ax1.set_ylabel('Score difference')

#ax2 = ax1.twinx()
#dh = ax2.plot(range(5), dff_noXPM, markersize=14, marker='.', color='darkred', alpha=0.6, linestyle='--')
#ax2.set_ylim(-0.15, 0.15)
#ax2.set_ylabel('Difference')

plt.legend(
    noXPM_p + Q_p + PG_p + PnotG_p,
    ['All', 'Emphasis', 'Gram. paraph.', 'Lex. paraph.'],
    loc='upper right',
    ncol=1,
)
fig.tight_layout(rect=[-0.03, -0.02, 1.01, 1.03])
plt.show()

if args.pdf is not None:
    fig.savefig(args.pdf)
