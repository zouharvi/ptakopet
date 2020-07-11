#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import numpy as np
import matplotlib.pyplot as plt
import re

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success, data))

dataC = {}

for segment in data:
    if segment.cid.engine[:2] == 'et':
        continue
    if segment.grades == {}:
        continue

    cid_small = segment.cid.__str__()
    cid_small = re.sub(r'ft\..-', '', cid_small)
    cid_small = re.sub(r'-[a-z]+$', '', cid_small)
    
    cid_small = re.sub(r'..\.n', '', cid_small)
    cid_small = re.sub(r'\.y', ' ', cid_small)
    cid_small = re.sub(r'-', '', cid_small)
    cid_small = re.sub(r'\s$', '', cid_small)
    cid_small = cid_small.upper()
    cid_small = f'({cid_small})'
    if cid_small == '()':
        cid_small = '-'

    dataC.setdefault(cid_small, [[], []])[0].append(segment.score)
    dataC.setdefault(cid_small, [[], []])[1].append(
        np.average(list(segment.grades.values())))

correlationsX = (dataC.keys())
correlationsY = [np.corrcoef(x[0], x[1])[0][1] for x in list(dataC.values())]
correlations = list(zip(correlationsX, correlationsY))
correlations.sort(key=lambda x: x[1], reverse=True)

correlationsX = [x[0] for x in correlations]
correlationsY = [x[1] for x in correlations]

# TODO: rotate x labels

plt.xlabel('Module configurations', )
plt.ylabel('Confidence and quality correlation')

plt.scatter(correlationsX, correlationsY)
plt.show()
