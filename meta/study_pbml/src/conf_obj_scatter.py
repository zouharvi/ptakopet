#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import matplotlib.pyplot as plt
import numpy as np
from collections import Counter
import math

GRAYSCALE = False

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success, data))
ratings = []
grades = []
heat = [[0]*5 for _ in range(5)]
total = 0

for segment in data:
    if segment.grades != {}:
        grade = np.round(np.round(np.average(list(segment.grades.values()))))
        score = segment.score

        grades.append(grade)
        ratings.append(score)
        heat[5-int(grade)][int(score)-1] += 1
        total += 1

heatv = list(heat)
heat = [[x/total for x in row] for row in heat]


fig, ax = plt.subplots()

if GRAYSCALE:
    plt.gray()

im = ax.imshow(heat)

ax.set_xticks(np.arange(5))
ax.set_yticks(np.arange(5))
ax.set_xticklabels(range(1, 6))
ax.set_yticklabels(range(5, 0, -1))

for i in range(5):
    for j in range(4, -1, -1):
        text = ax.text(j, i, f'{heat[i][j]*100:.2f}%\n({heatv[i][j]})',
                       ha="center", va="center", color="w" if heat[i][j] < 0.15 else 'black')


plt.xlabel('Self-reported confidence')
plt.ylabel('Average grade (rounded)')

fig.tight_layout()

plt.show()
