#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog
import matplotlib.pyplot as plt
import numpy as np
import sys

SCORE_NAMES = ["src_sti_adq", "tgt_src_adq", "tgt_sti_adq", "tgt_flu", "overall"]

def filter_data(data, config_filter=None):
    return [ x for x in data if config_filter(x.cid) ]

def average_final_scores(data):
    all_grades = []
    all_confid = []
    for segment in data:
        seg_grades = [[getattr(f, sn) for sn in SCORE_NAMES] for f in segment.grade_f]
        all_grades.extend(seg_grades)
        all_confid.append(segment.score)
    avg_grades_arr = np.nanmean(np.array(all_grades, dtype=float), axis=0)
    avg_confid = np.mean(all_confid)
    return avg_grades_arr.tolist() + [ avg_confid ]

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
print_tab_line(scores_line, "Czech MT 1")
print("Czech MT 1: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.engine == "cs")
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "Czech MT 2")
print("Czech MT 2: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.engine == "css")
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "Czech MT 3")
print("Czech MT 3: len = {:d}".format(len(data_line)), file=sys.stderr)

data_line = filter_data(data, lambda sid: sid.engine == "et")
scores_line = average_final_scores(data_line)
print_tab_line(scores_line, "Estonian")
print("Estonian: len = {:d}".format(len(data_line)), file=sys.stderr)

print("\\hline")

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

print("\\hline")

scores_line = average_final_scores(data)
print_tab_line(scores_line, "Total")
print("TOTAL: len = {:d}".format(len(data)), file=sys.stderr)
