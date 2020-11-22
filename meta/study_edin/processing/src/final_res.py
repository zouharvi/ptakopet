#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog, aggr_grades_by_src
import matplotlib.pyplot as plt
import numpy as np
import sys

def filter_data(data, config_filter=None):
    return [ x for x in data if config_filter(x.cid) ]

def average_final_scores(data):
    all_grades = np.array([aggr_grades_by_src(x.grade_f)[0][2] for x in data], dtype=float)
    all_confid = np.array([x.score for x in data], dtype=float)
    avg_grades = np.nanmean(all_grades, axis=0)
    avg_confid = np.nanmean(all_confid, axis=0)
    return avg_grades.tolist() + [ avg_confid.tolist() ]

def print_tab_line(scores, title):
    linestr = " & ".join([title] + ["{:.2f}".format(s) for s in scores])
    linestr += " \\\\"
    print(linestr)

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

data_line = filter_data(data, lambda sid: sid.bt and sid.qe and sid.pp)
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "BT QE PP")
print("BT QE PP: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.bt and sid.qe and not sid.pp)
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "BT QE")
print("BT QE: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.bt and not sid.qe and sid.pp)
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "BT PP")
print("BT PP: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and sid.qe and sid.pp)
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "QE PP")
print("QE PP: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.bt and not sid.qe and not sid.pp)
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "BT")
print("BT: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and sid.qe and not sid.pp)
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "QE")
print("QE: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and not sid.qe and sid.pp)
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "PP")
print("PP: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: not sid.bt and not sid.qe and not sid.pp)
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "--")
print("--: len = {:d}".format(len(data_line)), file=sys.stderr)

print("\\midrule")

scores_line = average_final_scores(data)
print_tab_line(scores_line, "Total")
print("TOTAL: len = {:d}".format(len(data)), file=sys.stderr)
