#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import matplotlib.pyplot as plt
import numpy as np


parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('--filter', type=int, default=0, help='Which filter to use')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success, data))

ratingPosX = []
ratingPosY = []
ratingPos = [[] for _ in range(100)]
ratingSID = {}

dataU = {}
for segment in data:
    dataU.setdefault(segment.uid, []).append(segment)

for uid in dataU.keys():
    pos = 0
    prevBlock = None
    for segment in dataU[uid]:
        pos += 1
        
        # if prevBlock != segment.block:
        #     pos = 0
        ratingSID.setdefault(segment.sid, []).append(segment.score)

        ratingPosX.append(pos)
        ratingPosY.append(segment.score)
        ratingPos[pos].append(segment.score)
        prevBlock = segment.block

ratingPosAvg = [np.average(x) for x in ratingPos]
ratingPosSum = [sum(x) for x in ratingPos]
ratingPosVar = [np.var(x) for x in ratingPos]

# plt.scatter(ratingPosX, ratingPosY)
plt.scatter(range(100), ratingPosAvg)
plt.show()