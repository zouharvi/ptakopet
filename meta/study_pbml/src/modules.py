#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import matplotlib.pyplot as plt
import numpy as np

GRAYSCALE = True


parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success, data))

# TODO: Do this per model?
dataM = {
    'qe+': [], 'pp+': [], 'ft+': [], 'bt+': [], 'all': [],
    'qe-': [], 'pp-': [], 'ft-': [], 'bt-': []
}
dataG = {
    'qe+': [], 'pp+': [], 'ft+': [], 'bt+': [], 'all': [],
    'qe-': [], 'pp-': [], 'ft-': [], 'bt-': []
}

users = set()

for segment in data:
    if segment.cid.engine[:2] == 'et' or segment.grades == {}:
        continue

    avgGrade = np.average(list(segment.grades.values()))

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

    dataM['all'].append(segment.score)
    dataG['all'].append(avgGrade)

dataM = {k:np.average(v) for (k,v) in dataM.items()}
dataG = {k:np.average(v) for (k,v) in dataG.items()}

offsetX = 0.1

aConfLine = plt.plot([0-offsetX, 2+offsetX], [dataM['all']]*2, c='gray', linestyle=':')
aGradeLine = plt.plot([0-offsetX, 2+offsetX], [dataG['all']]*2, c='gray', linestyle='-.')

if GRAYSCALE:
    gPointConfEn  = plt.scatter([0-offsetX], [dataM['qe+']], marker='^', c='black')
    gPointConfDis = plt.scatter([0-offsetX], [dataM['qe-']], marker='v', c='black')
    plt.scatter([1-offsetX], [dataM['bt+']], marker='^', c='black')
    plt.scatter([1-offsetX], [dataM['bt-']], marker='v', c='black')
    plt.scatter([2-offsetX], [dataM['pp+']], marker='^', c='black')
    plt.scatter([2-offsetX], [dataM['pp-']], marker='v', c='black')

    gPointGradeEn  = plt.scatter([0+offsetX], [dataG['qe+']], marker='2', c='black')
    gPointGradeDis = plt.scatter([0+offsetX], [dataG['qe-']], marker='1', c='black')
    plt.scatter([1+offsetX], [dataG['bt+']], marker='2', c='black')
    plt.scatter([1+offsetX], [dataG['bt-']], marker='1', c='black')
    plt.scatter([2+offsetX], [dataG['pp+']], marker='2', c='black')
    plt.scatter([2+offsetX], [dataG['pp-']], marker='1', c='black')
else:
    gPointConfEn  = plt.scatter([0-offsetX], [dataM['qe+']], marker='^', c='navy')
    gPointConfDis = plt.scatter([0-offsetX], [dataM['qe-']], marker='v', c='royalblue')
    plt.scatter([1-offsetX], [dataM['bt+']], marker='^', c='navy')
    plt.scatter([1-offsetX], [dataM['bt-']], marker='v', c='royalblue')
    plt.scatter([2-offsetX], [dataM['pp+']], marker='^', c='navy')
    plt.scatter([2-offsetX], [dataM['pp-']], marker='v', c='royalblue')

    gPointGradeEn  = plt.scatter([0+offsetX], [dataG['qe+']], marker='2', c='darkgreen')
    gPointGradeDis = plt.scatter([0+offsetX], [dataG['qe-']], marker='1', c='seagreen')
    plt.scatter([1+offsetX], [dataG['bt+']], marker='2', c='darkgreen')
    plt.scatter([1+offsetX], [dataG['bt-']], marker='1', c='seagreen')
    plt.scatter([2+offsetX], [dataG['pp+']], marker='2', c='darkgreen')
    plt.scatter([2+offsetX], [dataG['pp-']], marker='1', c='seagreen')

plt.xticks([0, 1, 2], ['Quality Estimation', 'Backward Translation', 'Paraphrases'])
plt.ylabel('Score')
plt.ylim(3, 5)
plt.xlim(-0.2, 2.2)

plt.legend(
    (gPointConfEn, gPointConfDis, aConfLine[0], gPointGradeEn, gPointGradeDis, aGradeLine[0]),
    ('Confidence, module enabled', 'Confidence, module disabled', 'Confidence, average', 'Translation quality, module enabled', 'Translation quality, module disabled', 'Translation quality, average'))

plt.show()

print('score',dataM)
print('grade',dataG)