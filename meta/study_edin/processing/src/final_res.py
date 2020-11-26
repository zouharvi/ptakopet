#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog, aggr_grades_by_src
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import mannwhitneyu
import sys

def filter_data(data, config_filter=None):
    return [ x for x in data if config_filter(x.cid) ]

def average_final_scores(data, return_grades=False, return_confid=False):
    all_grades = np.array([aggr_grades_by_src(x.grade_f)[0][2] for x in data], dtype=float)
    all_confid = np.array([x.score for x in data], dtype=float)
    avg_grades = np.nanmean(all_grades, axis=0)
    avg_confid = np.nanmean(all_confid, axis=0)
    avg = avg_grades.tolist() + [ avg_confid.tolist() ]
    return_tuple = tuple()
    if return_grades:
        return_tuple += (all_grades,)
    if return_confid:
        return_tuple += (all_confid,)
    if len(return_tuple) > 0:
        return (avg,) + return_tuple
    else:
        return avg

def calculate_pvalues(grades1, grades2, confids1, confids2):
    pvalues = []
    for i in range(grades1.shape[1]):
        (u, pvalue) = mannwhitneyu(grades1[:,i], grades2[:,i])
        pvalues.append(pvalue)
    (u, pvalue) = mannwhitneyu(confids1, confids2)
    pvalues.append(pvalue)
    return pvalues

def print_tab_line(scores, title, pvalues=None):
    linestr = " & ".join([title] + ["{:.2f}{:s}".format(s, significance_symbol(pvalues[i]) if pvalues is not None else "") for i, s in enumerate(scores)])
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

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = [x for x in data if (not x.invalid) and (len(x.grade_f) != 0)]

#data = [x for x in data if len(x.grade_v) > 0]
#data = [x for x in data if any([x.grade_f[0].src != g.src for g in x.grade_v])]

data_line = filter_data(data, lambda sid: sid.engine == "csw")
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "Czech 1")
print("Czech 1: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.engine == "cs")
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "Czech 2")
print("Czech 2: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.engine == "css")
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "Czech 3")
print("Czech 3: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.engine == "et")
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "Estonian")
print("Estonian: len = {:d}".format(len(data_line)), file=sys.stderr)

print("\\midrule")

data_line = filter_data(data, lambda sid: not sid.bt and not sid.qe and not sid.pp)
(scores_nocue, grades_nocue, confid_nocue) = average_final_scores(data_line, return_grades=True, return_confid=True)

data_line = filter_data(data, lambda sid: sid.bt and sid.qe and sid.pp)
(scores_line, grades_line, confid_line) = average_final_scores(data_line, return_grades=True, return_confid=True)
pvalues_line = calculate_pvalues(grades_line, grades_nocue, confid_line, confid_nocue)
print_tab_line(scores_line, "BT QE PP", pvalues_line)
print("BT QE PP: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.bt and sid.qe and not sid.pp)
(scores_line, grades_line, confid_line) = average_final_scores(data_line, return_grades=True, return_confid=True)
pvalues_line = calculate_pvalues(grades_line, grades_nocue, confid_line, confid_nocue)
print_tab_line(scores_line, "BT QE", pvalues_line)
print("BT QE: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.bt and not sid.qe and sid.pp)
(scores_line, grades_line, confid_line) = average_final_scores(data_line, return_grades=True, return_confid=True)
pvalues_line = calculate_pvalues(grades_line, grades_nocue, confid_line, confid_nocue)
print_tab_line(scores_line, "BT PP", pvalues_line)
print("BT PP: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and sid.qe and sid.pp)
(scores_line, grades_line, confid_line) = average_final_scores(data_line, return_grades=True, return_confid=True)
pvalues_line = calculate_pvalues(grades_line, grades_nocue, confid_line, confid_nocue)
print_tab_line(scores_line, "QE PP", pvalues_line)
print("QE PP: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.bt and not sid.qe and not sid.pp)
(scores_line, grades_line, confid_line) = average_final_scores(data_line, return_grades=True, return_confid=True)
pvalues_line = calculate_pvalues(grades_line, grades_nocue, confid_line, confid_nocue)
print_tab_line(scores_line, "BT", pvalues_line)
print("BT: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and sid.qe and not sid.pp)
(scores_line, grades_line, confid_line) = average_final_scores(data_line, return_grades=True, return_confid=True)
pvalues_line = calculate_pvalues(grades_line, grades_nocue, confid_line, confid_nocue)
print_tab_line(scores_line, "QE", pvalues_line)
print("QE: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and not sid.qe and sid.pp)
(scores_line, grades_line, confid_line) = average_final_scores(data_line, return_grades=True, return_confid=True)
pvalues_line = calculate_pvalues(grades_line, grades_nocue, confid_line, confid_nocue)
print_tab_line(scores_line, "PP", pvalues_line)
print("PP: len = {:d}".format(len(data_line)), file=sys.stderr)
print(pvalues_line, file=sys.stderr)

print_tab_line(scores_line, "--")
print("--: len = {:d}".format(len(data_line)), file=sys.stderr)

print("\\midrule")

scores_line = average_final_scores(data)
print_tab_line(scores_line, "Total")
print("TOTAL: len = {:d}".format(len(data)), file=sys.stderr)
