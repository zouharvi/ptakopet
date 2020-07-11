#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import numpy as np
from collections import Counter
import matplotlib.pyplot as plt


parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success and segment.grades != {}, data))

score = [[],[],[],[],[],[]]
grade = [[],[],[],[],[],[]]
duration = []

for segment in data:
    if segment.grades == {}:
        continue
    
    time = (int(segment.data[-1][1]) - int(segment.data[0][1]))/1000
    if time >= 60*6:
        continue
    bucket = int(time)//60
    grade[bucket].append(np.average(list(segment.grades.values())))
    score[bucket].append(segment.score)
    # duration.append(time)

score = [np.average(x) for x in score]
grade = [np.average(x) for x in grade]
plt.scatter(range(6), score)
plt.scatter(range(6), grade)
plt.ylim(1,5)
plt.show()