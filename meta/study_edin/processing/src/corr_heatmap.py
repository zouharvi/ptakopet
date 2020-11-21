#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog
import matplotlib.pyplot as plt
import numpy as np
from collections import Counter
import math

GRAYSCALE = False

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [
    x for x in data if
    (len(x.grade_f) != 0) and
    (x.score is not None) and
    not x.invalid
]

grades_0 = []
grades_1 = []
grades_2 = []
grades_3 = []
grades_4 = []
grades_x = []

for segment in data:
    grade_0 = np.average([x.src_sti_adq for x in segment.grade_f if x.src_sti_adq is not None])
    grade_1 = np.average([x.tgt_src_adq for x in segment.grade_f if x.tgt_src_adq is not None])
    grade_2 = np.average([x.tgt_sti_adq for x in segment.grade_f if x.tgt_sti_adq is not None])
    grade_3 = np.average([x.tgt_flu     for x in segment.grade_f if x.tgt_flu is not None])
    grade_4 = np.average([x.overall     for x in segment.grade_f if x.overall is not None])
    if np.isnan(grade_1) or np.isnan(grade_2) or np.isnan(grade_3) or np.isnan(grade_4) or np.isnan(grade_0):
        continue
    grades_0.append(grade_0)
    grades_1.append(grade_1)
    grades_2.append(grade_2)
    grades_3.append(grade_3)
    grades_4.append(grade_4)
    grades_x.append(segment.score)


corrs = np.corrcoef((grades_0, grades_1, grades_2, grades_3, grades_4, grades_x))

def corrd(x, y):
    return f'{corrs[x][y]:.2f}'

print(('\n'+'%'*10)*4)
print(f'SRC-STI & {corrd(0,1)} & {corrd(0,2)} & {corrd(0,3)} & {corrd(0,4)} & {corrd(0,5)} \\\\')
print(f'TGT-SRC &              & {corrd(1,2)} & {corrd(1,3)} & {corrd(1,4)} & {corrd(1,5)} \\\\')
print(f'TGT-STI &              &              & {corrd(2,3)} & {corrd(2,4)} & {corrd(2,5)} \\\\')
print(f'Fluency &              &              &              & {corrd(3,4)} & {corrd(3,5)} \\\\')
print(f'Overall &              &              &              &              & {corrd(4,5)} \\\\')
print(('\n'+'%'*10)*4)