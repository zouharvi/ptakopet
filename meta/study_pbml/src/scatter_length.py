#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import numpy as np
from collections import Counter
import matplotlib.pyplot as plt

GRAYSCALE = True


parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success and segment.grades != {}, data))

score = [[],[],[],[],[], [], []]
grade = [[],[],[],[],[], [], []]
duration = []

for segment in data:
    if segment.grades == {}:
        continue
    
    for line in segment.data:
        if line[0] == 'CONFIRM_OK':
            source = line[3]

    length = len(source.split(' '))
    if length <= 6:
        bucket = 0
    elif length <= 8:
        bucket = 1
    elif length <= 11:
        bucket = 2
    elif length <= 15:
        bucket = 3
    elif length <= 20:
        bucket = 4
    elif length <= 25:
        bucket = 5
    else:
        bucket = 6
        
    grade[bucket].append(np.average(list(segment.grades.values())))
    score[bucket].append(segment.score)
    # duration.append(time)

score = [np.average(x) for x in score]
grade = [np.average(x) for x in grade]
if GRAYSCALE:
    # scorePoint = plt.scatter([x-0.05 for x in range(7)], score, color='white', edgecolor='black', hatch='/'*4, marker='2')
    # gradePoint = plt.scatter([x+0.05 for x in range(7)], grade, color='white', edgecolor='black', hatch='.'*4)

    scorePoint = plt.scatter([x-0.05 for x in range(7)], score, color='black', marker='2')
    gradePoint = plt.scatter([x+0.05 for x in range(7)], grade, color='black')
else:
    scorePoint = plt.scatter([x-0.05 for x in range(7)], score, marker='2')
    gradePoint = plt.scatter([x+0.05 for x in range(7)], grade, color='darkgreen')


plt.ylim(3,5)
plt.legend((scorePoint, gradePoint), ('Self-reported confidence', 'Translation quality'))
plt.xticks([0, 1, 2, 3, 4, 5, 6], ['<7', '7-8', '9-11', '12-15', '16-20', '21-25', '>25'])
plt.xlabel('Number of input tokens')
plt.ylabel('Score')

plt.show()