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
data = [x for x in data if (not x.invalid) and (len(x.grade_f) != 0)]

# TODO: Do this per model?
dataM = {
    'qe+': [], 'pp+': [], 'ft+': [], 'bt+': [], 'all': [],
    'qe-': [], 'pp-': [], 'ft-': [], 'bt-': [],
    'csw': [], 'cs':  [], 'css': [], 'et':  [],
}
dataG = {
    'qe+': [], 'pp+': [], 'ft+': [], 'bt+': [], 'all': [],
    'qe-': [], 'pp-': [], 'ft-': [], 'bt-': [],
    'csw': [], 'cs':  [], 'css': [], 'et':  [],
}

users = set()

for segment in data:
    if segment.grade_f:
        avgGrade = np.average([float(x.overall) for x in segment.grade_f])
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

offsetX = 0.07
MARKER_SIZE = 100

fig = plt.figure(figsize=(9, 5))

aConfLine = plt.plot([0-offsetX, 4.5+offsetX], [dataM['all']]*2, c='gray', linestyle=':')
aGradeLine = plt.plot([0-offsetX, 4.5+offsetX], [dataG['all']]*2, c='gray', linestyle='-.')

gPointConfEn  = plt.scatter([0-offsetX], [dataM['qe+']], s=MARKER_SIZE, marker='^', c='firebrick')
gPointConfDis = plt.scatter([0-offsetX], [dataM['qe-']], s=MARKER_SIZE, marker='v', c='lightcoral')
plt.scatter([1-offsetX], [dataM['bt+']], s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([1-offsetX], [dataM['bt-']], s=MARKER_SIZE, marker='v', c='lightcoral')
plt.scatter([2-offsetX], [dataM['pp+']], s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([2-offsetX], [dataM['pp-']], s=MARKER_SIZE, marker='v', c='lightcoral')
plt.scatter([3-offsetX], [dataM['csw']], s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([3.5-offsetX], [dataM['cs']],  s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([4-offsetX],   [dataM['css']], s=MARKER_SIZE, marker='^', c='firebrick')
plt.scatter([4.5-offsetX], [dataM['et']],  s=MARKER_SIZE, marker='^', c='firebrick')

gPointGradeEn  = plt.scatter([0+offsetX], [dataG['qe+']], s=MARKER_SIZE, marker='2', c='darkgreen')
gPointGradeDis = plt.scatter([0+offsetX], [dataG['qe-']], s=MARKER_SIZE, marker='1', c='seagreen')
plt.scatter([1+offsetX], [dataG['bt+']], s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([1+offsetX], [dataG['bt-']], s=MARKER_SIZE, marker='1', c='seagreen')
plt.scatter([2+offsetX], [dataG['pp+']], s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([2+offsetX], [dataG['pp-']], s=MARKER_SIZE, marker='1', c='seagreen')
plt.scatter([3-offsetX], [dataG['csw']],  s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([3.5-offsetX], [dataG['cs']],  s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([4-offsetX],   [dataG['css']], s=MARKER_SIZE, marker='2', c='darkgreen')
plt.scatter([4.5-offsetX], [dataG['et']],  s=MARKER_SIZE, marker='2', c='darkgreen')

plt.xticks([0, 1, 2, 3, 3.5, 4, 4.5], ['Quality Estimation', 'Backward Translation', 'Paraphrases', 'Czech 1', 'Czech 2', 'Czech 3', 'Estonian'])
plt.ylabel('Score')
plt.ylim(3, 5)
plt.xlim(-0.3, 4.7)

plt.legend(
    (gPointConfEn, gPointConfDis, aConfLine[0], gPointGradeEn, gPointGradeDis, aGradeLine[0]),
    ('Confidence, module enabled', 'Confidence, module disabled', 'Confidence, average', 'Translation quality, module enabled', 'Translation quality, module disabled', 'Translation quality, average'),
    ncol=2,
    # loc='upper right'
)

plt.tight_layout()
plt.show()

print('score',dataM)
print('grade',dataG)