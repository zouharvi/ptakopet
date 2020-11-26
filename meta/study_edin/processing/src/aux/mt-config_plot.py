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

parser = argparse.ArgumentParser(description='Generating MT vs. Config plot')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('pdf', help='Path to the output PDF')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = [x for x in data if (not x.invalid) and (len(x.grade_f) != 0)]

#data = [x for x in data if len(x.grade_v) > 0]
#data = [x for x in data if any([x.grade_f[0].src != g.src for g in x.grade_v])]

all_overall = {}
all_confid = {}

for mts in ["csw", "cs", "css", "et"]:
    data_mts = filter_data(data, lambda sid: sid.engine == mts)

    overall_mts = []
    confid_mts = []

    data_line = filter_data(data_mts, lambda sid: sid.bt and sid.qe and sid.pp)
    scores_line = average_final_scores(data_line)
    overall_mts.append(scores_line[4])
    confid_mts.append(scores_line[5])

    data_line = filter_data(data_mts, lambda sid: sid.bt and sid.qe and not sid.pp)
    scores_line = average_final_scores(data_line)
    overall_mts.append(scores_line[4])
    confid_mts.append(scores_line[5])

    data_line = filter_data(data_mts, lambda sid: sid.bt and not sid.qe and sid.pp)
    scores_line = average_final_scores(data_line)
    overall_mts.append(scores_line[4])
    confid_mts.append(scores_line[5])

    data_line = filter_data(data_mts, lambda sid: not sid.bt and sid.qe and sid.pp)
    scores_line = average_final_scores(data_line)
    overall_mts.append(scores_line[4])
    confid_mts.append(scores_line[5])

    data_line = filter_data(data_mts, lambda sid: sid.bt and not sid.qe and not sid.pp)
    scores_line = average_final_scores(data_line)
    overall_mts.append(scores_line[4])
    confid_mts.append(scores_line[5])

    data_line = filter_data(data_mts, lambda sid: not sid.bt and sid.qe and not sid.pp)
    scores_line = average_final_scores(data_line)
    overall_mts.append(scores_line[4])
    confid_mts.append(scores_line[5])

    data_line = filter_data(data_mts, lambda sid: not sid.bt and not sid.qe and sid.pp)
    scores_line = average_final_scores(data_line)
    overall_mts.append(scores_line[4])
    confid_mts.append(scores_line[5])

    data_line = filter_data(data_mts, lambda sid: not sid.bt and not sid.qe and not sid.pp)
    scores_line = average_final_scores(data_line)
    overall_mts.append(scores_line[4])
    confid_mts.append(scores_line[5])

    all_overall[mts] = overall_mts
    all_confid[mts] = confid_mts

print(all_overall)
print(all_confid)

MT_SYSTEM_NAMES = ["Czech 1", "Czech 2", "Czech 3", "Estonian"]
CONFIG_NAMES = ["BT QE PP", "BT QE", "BT PP", "QE PP", "BT", "QE", "PP", "--"]

OFFSETX = 0.15
fig = plt.figure(figsize=(4.2, 3.2))
ax1 = fig.add_subplot()

csw_overall_curve = ax1.plot(range(len(CONFIG_NAMES)), all_overall["csw"], markersize=6, marker='s', color='darkblue', alpha=0.6)
cs_overall_curve  = ax1.plot(range(len(CONFIG_NAMES)), all_overall["cs"],  markersize=6, marker='v', color='darkgreen', alpha=0.6)
css_overall_curve = ax1.plot(range(len(CONFIG_NAMES)), all_overall["css"], markersize=10, marker='.', color='darkred', alpha=0.6)
et_overall_curve  = ax1.plot(range(len(CONFIG_NAMES)), all_overall["et"],  markersize=6, marker='^', color='darkorange', alpha=0.6)
csw_confid_curve = ax1.plot(range(len(CONFIG_NAMES)), all_confid["csw"], linestyle="--", markersize=6, marker='s', color='darkblue', alpha=0.6)
cs_confid_curve  = ax1.plot(range(len(CONFIG_NAMES)), all_confid["cs"],  linestyle="--", markersize=6, marker='v', color='darkgreen', alpha=0.6)
css_confid_curve = ax1.plot(range(len(CONFIG_NAMES)), all_confid["css"], linestyle="--", markersize=10, marker='.', color='darkred', alpha=0.6)
et_confid_curve  = ax1.plot(range(len(CONFIG_NAMES)), all_confid["et"],  linestyle="--", markersize=6, marker='^', color='darkorange', alpha=0.6)
#ax1.set_ylim(3.9, 4.5)
ax1.set_xticks(range(len(CONFIG_NAMES)))
ax1.set_xticklabels(CONFIG_NAMES)
ax1.set_ylabel('Configs')

#ax2 = ax1.twinx()
#dh = ax2.plot(range(5), dff_noXPM, markersize=14, marker='.', color='darkred', alpha=0.6, linestyle='--')
#ax2.set_ylim(-0.15, 0.15)
#ax2.set_ylabel('Difference')

plt.legend(
    csw_overall_curve + cs_overall_curve + css_overall_curve + et_overall_curve + csw_confid_curve + cs_confid_curve + css_confid_curve + et_confid_curve,
    MT_SYSTEM_NAMES + MT_SYSTEM_NAMES,
    loc='lower left',
    ncol=2,
)
fig.tight_layout(rect=[-0.03, -0.02, 1.01, 1.03])
#plt.show()

if args.pdf is not None:
    fig.savefig(args.pdf)
