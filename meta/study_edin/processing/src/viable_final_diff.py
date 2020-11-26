#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog, aggr_grades_by_src
import numpy as np
import re
import sys
from scipy.stats import wilcoxon

def filter_data(data, config_filter=None):
    return [ x for x in data if config_filter(x.cid) ]

def average_grade_diffs(data, return_diffs=True):
    grade_diffs = []
    for x in data:
        f = aggr_grades_by_src(x.grade_f)[0]
        v_list = aggr_grades_by_src(x.grade_v, changetype=True)
        v_list = [ v for v in v_list if v[0] != f[0] ]
        v_list = [ v for v in v_list if not re.match(r'X', v[3]) ]
        if len(v_list) > 0:
            diff_list = [ f[2] - v[2] for v in v_list ]
            grade_diffs.extend(diff_list)
            #avg_diff = np.nanmean(np.array(diff_list, dtype=float), axis=0)
            #grade_diffs.append(avg_diff)
    avg_grades = np.nanmean(np.array(grade_diffs, dtype=float), axis=0)
    if return_diffs:
        return (avg_grades.tolist(), np.array(grade_diffs, dtype=float))
    else:
        return avg_grades.tolist()

def calculate_pvalues(grade_diffs):
    pvalues = []
    for i in range(grade_diffs.shape[1]):
        (stat, pvalue) = wilcoxon(grade_diffs[:,i])
        pvalues.append(pvalue)
    return pvalues

def print_tab_line(scores, title, pvalues):
    linestr = " & ".join([title] + ["\\textcolor{{{:s}}}{{{:+.2f}}}{:s}".format(
        "darkgreen" if df_val > 0 else "darkred",
        df_val,
        significance_symbol(pvalues[i]) if pvalues is not None else ""
        ) for i, df_val in enumerate(scores)])
    linestr += " \\\\"
    print(linestr)

def significance_symbol(pvalue):
    if pvalue < 0.001:
        return "\\threeS"
    elif pvalue < 0.01:
        return "\\twoS"
    elif pvalue < 0.05:
        return "\\oneS"
    else:
        return ""

parser = argparse.ArgumentParser(description='Generate a table of score differences between intermediate and final viable inputs.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [
    x for x in data if
    (len(x.grade_f) != 0) and
    not x.invalid
]

data = [x for x in data if len(x.grade_v) > 0]
data = [x for x in data if any([x.grade_f[0].src != g.src for g in x.grade_v])]

#data_line = filter_data(data, lambda sid: sid.engine == "csw")
#scores_line = average_grade_diffs(data_line)
#print_tab_line(scores_line, "Czech 1")
#print("Czech 1: len = {:d}".format(len(data_line)), file=sys.stderr)
#
#data_line = filter_data(data, lambda sid: sid.engine == "cs")
#scores_line = average_grade_diffs(data_line)
#print_tab_line(scores_line, "Czech 2")
#print("Czech 2: len = {:d}".format(len(data_line)), file=sys.stderr)
#
#data_line = filter_data(data, lambda sid: sid.engine == "css")
#scores_line = average_grade_diffs(data_line)
#print_tab_line(scores_line, "Czech 3")
#print("Czech 3: len = {:d}".format(len(data_line)), file=sys.stderr)
#
#data_line = filter_data(data, lambda sid: sid.engine == "et")
#scores_line = average_grade_diffs(data_line)
#print_tab_line(scores_line, "Estonian")
#print("Estonian: len = {:d}".format(len(data_line)), file=sys.stderr)
#
#print("\\midrule")

data_line = filter_data(data, lambda sid: sid.bt and sid.qe and sid.pp)
(scores_line, diffs_line) = average_grade_diffs(data_line)
pvalues_line = calculate_pvalues(diffs_line)
print_tab_line(scores_line, "BT QE PP", pvalues_line)
print("BT QE PP: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.bt and sid.qe and not sid.pp)
(scores_line, diffs_line) = average_grade_diffs(data_line)
pvalues_line = calculate_pvalues(diffs_line)
print_tab_line(scores_line, "BT QE", pvalues_line)
print("BT QE: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.bt and not sid.qe and sid.pp)
(scores_line, diffs_line) = average_grade_diffs(data_line)
pvalues_line = calculate_pvalues(diffs_line)
print_tab_line(scores_line, "BT PP", pvalues_line)
print("BT PP: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and sid.qe and sid.pp)
(scores_line, diffs_line) = average_grade_diffs(data_line)
pvalues_line = calculate_pvalues(diffs_line)
print_tab_line(scores_line, "QE PP", pvalues_line)
print("QE PP: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.bt and not sid.qe and not sid.pp)
(scores_line, diffs_line) = average_grade_diffs(data_line)
pvalues_line = calculate_pvalues(diffs_line)
print_tab_line(scores_line, "BT", pvalues_line)
print("BT: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and sid.qe and not sid.pp)
(scores_line, diffs_line) = average_grade_diffs(data_line)
pvalues_line = calculate_pvalues(diffs_line)
print_tab_line(scores_line, "QE", pvalues_line)
print("QE: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and not sid.qe and sid.pp)
(scores_line, diffs_line) = average_grade_diffs(data_line)
pvalues_line = calculate_pvalues(diffs_line)
print_tab_line(scores_line, "PP", pvalues_line)
print("PP: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and not sid.qe and not sid.pp)
(scores_line, diffs_line) = average_grade_diffs(data_line)
pvalues_line = calculate_pvalues(diffs_line)
print_tab_line(scores_line, "--", pvalues_line)
print("--: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

print("\\midrule")

(scores_line, diffs_line) = average_grade_diffs(data)
pvalues_line = calculate_pvalues(diffs_line)
print_tab_line(scores_line, "Total", pvalues_line)
print("TOTAL: len = {:d}".format(len(data)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)
