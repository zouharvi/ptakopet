#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import numpy as np
from collections import Counter

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success and segment.grades != {}, data))

grade = {'csw': [], 'cs': []}
score = {'csw': [], 'cs': []}
duration = {'csw': [], 'cs': []}
interaction = {'csw': [], 'cs': []}

for segment in data:
    if segment.grades == {}:
        continue

    grade[segment.cid.engine].append(np.average(list(segment.grades.values())))
    score[segment.cid.engine].append(segment.score)

    time = (int(segment.data[-1][1]) - int(segment.data[0][1]))/1000
    if time <= 60*3:
        duration[segment.cid.engine].append(time)
        interaction[segment.cid.engine].append(len(list(filter(lambda x: x[0] in {'TRANSLATE2'}, segment.data))))
    

print('AVERAGE')
print('grades:', {k:np.average(v) for (k,v) in grade.items()})
print('scores:', {k:np.average(v) for (k,v) in score.items()})
print('duration:', {k:np.average(v) for (k,v) in duration.items()})
print('interaction:', {k:np.average(v) for (k,v) in interaction.items()})


print('STD')
print('grades:', {k:np.std(v) for (k,v) in grade.items()})
print('scores:', {k:np.std(v) for (k,v) in score.items()})
print('duration:', {k:np.std(v) for (k,v) in duration.items()})
print('interaction:', {k:np.std(v) for (k,v) in interaction.items()})
