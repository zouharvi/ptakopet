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

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

OFFSET = 0.07
NLOCATORS = 4
LEGEND = False
fig = plt.figure(figsize=(9, 3))

for (graph_index, (ENGINE_CODE, ENGINE_NAME)) in enumerate([('csw', 'Czech 1'), ('cs', 'Czech 2'), ('css', 'Czech 3')]):    
    with open(args.blog3, 'rb') as f:
        data = pickle.load(f)

    data = [
        x for x in data if
        (len(x.grade_f) != 0) and
        (x.score is not None) and
        not x.invalid and
        (x.cid.engine == ENGINE_CODE) and
        len([x for line in x.data if line[0] == 'TRANSLATE1']) != 0
    ]

    c_req = {}
    c_tim = {}
    c_len = {}
    q_req = {}
    q_tim = {}
    q_len = {}

    for segment in data:
        avgGrade = np.round(np.average([float(x.overall)
                                        for x in segment.grade_v if x.overall is not None]))

        texts = [s[2] for s in segment.data if s[0] == 'TRANSLATE1']
        texts_len = [len(s[2]) for s in segment.data if s[0] == 'TRANSLATE1']

        if len(texts) != 0:
            c_req.setdefault(segment.score, []).append(len(texts))
            q_req.setdefault(avgGrade, []).append(len(texts))

            time = float(segment.data[-1][1])-float(segment.data[0][1])
            c_len.setdefault(segment.score, []).append(np.average(texts_len))
            q_len.setdefault(avgGrade, []).append(np.average(texts_len))

            if time <= 6*60*1000:
                c_tim.setdefault(segment.score, []).append(time/1000)
                q_tim.setdefault(avgGrade, []).append(time/1000)


    for segment in data:
        avgGrade = np.round(np.average([float(x.overall)
                                        for x in segment.grade_f if x.overall is not None]))

        texts = [s[3] for s in segment.data if s[0] == 'CONFIRM_OK']
        texts_len = [len(s[3]) for s in segment.data if s[0] == 'CONFIRM_OK']
        requests_count = len([s[2] for s in segment.data if s[0] == 'TRANSLATE1'])

        if len(texts) != 0:
            c_req.setdefault(segment.score, []).append(requests_count)
            q_req.setdefault(avgGrade, []).append(requests_count)

            time = float(segment.data[-1][1])-float(segment.data[0][1])
            c_len.setdefault(segment.score, []).append(np.average(texts_len))
            q_len.setdefault(avgGrade, []).append(np.average(texts_len))

            if time <= 6*60*1000:
                c_tim.setdefault(segment.score, []).append(time/1000)
                q_tim.setdefault(avgGrade, []).append(time/1000)


    SCORES = [x for x in range(1, 5+1)]
    c_req = {k: np.average(v) for (k, v) in c_req.items()}
    c_tim = {k: np.average(v) for (k, v) in c_tim.items()}
    c_len = {k: np.average(v) for (k, v) in c_len.items()}
    q_req = {k: np.average(v) for (k, v) in q_req.items()}
    q_tim = {k: np.average(v) for (k, v) in q_tim.items()}
    q_len = {k: np.average(v) for (k, v) in q_len.items()}

    # display plot
    plt.rcParams.update({'font.size': 11})

    

    # display confidence
    ax1 = plt.subplot(1, 3, graph_index+1)
    color = 'darkgreen'
    ax1.set_ylabel('Source text length (char)', color=color)
    ax1.tick_params(axis='y', labelcolor=color)
    sc1 = ax1.plot(
        [str(x) for x in SCORES],
        [c_len[k] for k in SCORES],
        color=color, label='Source text length',
        markersize=10, marker='o',
        alpha=0.6
    )
    ax1.yaxis.labelpad = -1
    ax1.yaxis.set_major_locator(MaxNLocator(NLOCATORS, min_n_ticks=NLOCATORS))
    ax1.set_ylim(45, 140)

    ax2 = ax1.twinx()
    color = 'darkred'
    ax2.set_ylabel('Requests', color=color)
    ax2.tick_params(axis='y', labelcolor=color)
    sc2 = ax2.plot(
        [str(x) for x in SCORES],
        [c_req[k] for k in SCORES],
        color=color, label='Requests',
        markersize=10, marker='v',
        alpha=0.6
    )
    ax2.yaxis.set_major_locator(MaxNLocator(NLOCATORS, min_n_ticks=NLOCATORS))
    ax2.yaxis.labelpad = -1
    ax2.set_ylim(1, 8)

    ax3 = ax1.twinx()
    color = 'darkblue'
    ax3.set_ylabel('Time (s)', color=color)
    ax3.tick_params(axis='y', labelcolor=color)
    sc3 = ax3.plot(
        [str(x) for x in SCORES],
        [c_tim[k] for k in SCORES],
        color=color, label='Time',
        markersize=10, marker='s',
        alpha=0.6
    )
    if graph_index == 2:
        ax3.spines['right'].set_position(('outward', 30))
        ax3.yaxis.labelpad = -5
        ax3.yaxis.set_major_locator(MaxNLocator(NLOCATORS, min_n_ticks=NLOCATORS))
        ax3.set_ylim(33, 100)


    # display qualities
    ax4 = ax1.twinx()
    color = 'lightgreen'
    ax4.set_ylabel('Source text length (char)', color=color)
    ax4.tick_params(axis='y', labelcolor=color)
    sc4 = ax4.plot(
        [str(x) for x in SCORES],
        [q_len[k] for k in SCORES],
        linestyle='--',
        color=color, label='Source text length',
        markersize=10, marker='o',
        alpha=1
    )
    ax4.yaxis.set_visible(False)
    ax4.set_ylim(45, 150)

    ax5 = ax1.twinx()
    color = 'lightcoral'
    ax5.set_ylabel('Requests', color=color)
    ax5.tick_params(axis='y', labelcolor=color)
    sc5 = ax5.plot(
        [str(x) for x in SCORES],
        [q_req[k] for k in SCORES],
        linestyle='--',
        color=color, label='Requests',
        markersize=10, marker='v',
        alpha=1
    )
    ax5.yaxis.set_visible(False)
    ax5.set_ylim(1.0, 8)

    ax6 = ax1.twinx()
    color = 'lightblue'
    ax6.set_ylabel('Time (s)', color=color)
    ax6.tick_params(axis='y', labelcolor=color)
    sc6 = ax6.plot(
        [str(x) for x in SCORES],
        [q_tim[k] for k in SCORES],
        linestyle='--',
        color=color, label='Time',
        markersize=10, marker='s',
        alpha=1
    )
    ax6.yaxis.set_visible(False)
    ax6.set_ylim(33, 100)

    if graph_index == 0:
        ax2.yaxis.set_visible(False)
        ax3.yaxis.set_visible(False)
    if graph_index == 1:
        ax1.yaxis.set_visible(False)
        ax2.yaxis.set_visible(False)
        ax3.yaxis.set_visible(False)
    if graph_index == 2:
        ax1.yaxis.set_visible(False)


    if graph_index == 1 and LEGEND:
        plt.xlabel('Self-reported user confidence, Overal translation quality')
        lns = sc1+sc4+sc2+sc5+sc3+sc6
        lbs = [
            'Text length, conf.', 'Text length, qual.',
            'Requests, conf.', 'Requests, qual.',
            'Time, conf.', 'Time, qual.'
        ]
        plt.legend(
            handles=lns, labels=lbs,
            loc='upper center',
            fancybox=True,
            bbox_to_anchor=(0.5, 1.3),
            ncol=3
        )

    # fig.tight_layout(rect=[-0.03, -0.05, 1.03, 1])
    plt.title(ENGINE_NAME)
    plt.subplots_adjust(wspace=0.05)

plt.tight_layout()
plt.show()