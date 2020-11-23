#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog
import matplotlib.pyplot as plt
import numpy as np

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = [x for x in data if (not x.invalid) and (len(x.grade_f) != 0) and x.score is not None]

CONFIG_KEYS = {
    'qe+', 'pp+', 'ft+', 'bt+', 'all',
    'qe-', 'pp-', 'ft-', 'bt-',
    'csw', 'cs', 'css', 'et',
}
MT_KEYS = {
    'csw', 'cs', 'css', 'et'
}

dataM = {k:[] for k in CONFIG_KEYS}
dataG = {k:[] for k in CONFIG_KEYS}

users = set()

for segment in data:
    if segment.grade_f:
        avgGrade = np.average([float(x.overall) for x in segment.grade_f if x.overall is not None])
    else:
        continue

    users.add(segment.uid)
    if segment.cid.qe:
        dataM['qe+'].append(segment.score)
        dataG['qe+'].append(avgGrade)
    else:
        dataM['qe-'].append(segment.score)
        dataG['qe-'].append(avgGrade)

    if segment.cid.pp:
        dataM['pp+'].append(segment.score)
        dataG['pp+'].append(avgGrade)
    else:
        dataM['pp-'].append(segment.score)
        dataG['pp-'].append(avgGrade)

    if segment.cid.bt:
        dataM['bt+'].append(segment.score)
        dataG['bt+'].append(avgGrade)
    else:
        dataM['bt-'].append(segment.score)
        dataG['bt-'].append(avgGrade)


    dataM[segment.cid.engine].append(segment.score)
    dataG[segment.cid.engine].append(avgGrade)

    dataM['all'].append(segment.score)
    dataG['all'].append(avgGrade)

dataM = {k:np.average(v) for (k,v) in dataM.items()}
dataG = {k:np.average(v) for (k,v) in dataG.items()}

OFFSETX = 0
MARKER_SIZE = 100

fig = plt.figure(figsize=(4, 4))

aConfLine  = plt.plot([-0.2, 6.2], [dataM['all']]*2, c='gray', linestyle=':')
aGradeLine = plt.plot([-0.2, 6.2], [dataG['all']]*2, c='gray', linestyle='-.')

gPointConfEn  = plt.scatter([0-OFFSETX], [dataM['qe+']], s=MARKER_SIZE, marker='^', c='firebrick')
gPointConfDis = plt.scatter([0-OFFSETX], [dataM['qe-']], s=MARKER_SIZE, marker='v', c='lightcoral')
plt.scatter([1-OFFSETX], [dataM['bt+']], s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([1-OFFSETX], [dataM['bt-']], s=MARKER_SIZE, marker='v', c='lightcoral')
plt.scatter([2-OFFSETX], [dataM['pp+']], s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([2-OFFSETX], [dataM['pp-']], s=MARKER_SIZE, marker='v', c='lightcoral')
plt.scatter([3], [dataM['csw']], s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([4], [dataM['cs']],  s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([5], [dataM['css']], s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([6], [dataM['et']],  s=MARKER_SIZE, marker='^', c='firebrick')

gPointGradeEn  = plt.scatter([0+OFFSETX], [dataG['qe+']], s=MARKER_SIZE, marker='2', c='darkgreen')
gPointGradeDis = plt.scatter([0+OFFSETX], [dataG['qe-']], s=MARKER_SIZE, marker='1', c='seagreen')
plt.scatter([1+OFFSETX], [dataG['bt+']], s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([1+OFFSETX], [dataG['bt-']], s=MARKER_SIZE, marker='1', c='seagreen')
plt.scatter([2+OFFSETX], [dataG['pp+']], s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([2+OFFSETX], [dataG['pp-']], s=MARKER_SIZE, marker='1', c='seagreen')
plt.scatter([3], [dataG['csw']],  s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([4], [dataG['cs']],  s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([5], [dataG['css']], s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([6], [dataG['et']],  s=MARKER_SIZE, marker='2', c='darkgreen')

plt.xticks(
    [0, 1, 2, 3, 4, 5, 6],
    # ['Quality Estimation', 'Backward Translation', 'Paraphrases', 'Czech 1', 'Czech 2', 'Czech 3', 'Estonian'],
    ['QE', 'BT', 'PP', 'CS 1', 'CS 2', 'CS 3', 'ET'],
    rotation=0)
plt.ylabel('Score')
plt.ylim(3.15, 4.4)
plt.xlim(-0.45, 6.45)

plt.legend(
    (gPointConfEn, gPointConfDis, aConfLine[0], gPointGradeEn, gPointGradeDis, aGradeLine[0]),
    ('Confidence, module enabled', 'Confidence, module disabled', 'Confidence, average', 'Translation quality, module enabled', 'Translation quality, module disabled', 'Translation quality, average'),
    ncol=1,
    fancybox=True,
    bbox_to_anchor=(0, 1, 1, 0),
    loc='lower center',
)

plt.tight_layout(rect=[-0.03, 0, 1, 1])
plt.show()

print('score',dataM)
print('grade',dataG)