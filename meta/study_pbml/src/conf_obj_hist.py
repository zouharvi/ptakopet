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

for segment in data:
    if segment.grades != {}:
        grades.append(np.round(np.average(list(segment.grades.values()))))
        ratings.append(segment.score)

ratings = Counter(ratings)
grades = Counter(grades)

if GRAYSCALE:
    bar1 = plt.bar([x-0.15 for x in ratings.keys()], ratings.values(), width=0.3, hatch='/'*4, color='white', edgecolor='black')
    bar2 = plt.bar([x+0.15 for x in grades.keys()], grades.values(), width=0.3, hatch='.'*4, color='white', edgecolor='black')
else:
    bar1 = plt.bar([x-0.15 for x in ratings.keys()], ratings.values(), width=0.3)
    bar2 = plt.bar([x+0.15 for x in grades.keys()], grades.values(), width=0.3, color='darkgreen')

print(grades)

plt.xlabel('Score')
plt.ylabel('Number of segments')

plt.legend((bar1, bar2), ('Self-reported confidence', 'Translation quality'))
# plt.scatter(range(100), ratingPosAvg)
plt.show()