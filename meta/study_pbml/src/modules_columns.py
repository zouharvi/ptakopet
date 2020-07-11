#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import numpy as np
import re

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success, data))

dataC = {}
dataG = {}

for segment in data:
    if segment.cid.engine[:2] == 'et':
        continue
    if segment.grades == {}:
        continue

    cid_small = segment.cid.__str__()
    cid_small = re.sub(r'ft\..-', '', cid_small)
    cid_small = re.sub(r'-[a-z]+$', '', cid_small)
    
    dataC.setdefault(cid_small, []).append(segment)
    dataG.setdefault(cid_small, []).append(segment)

dataC = {k:np.average([x.score for x in v]) for (k,v) in dataC.items()}.items()
dataC = list(dataC)
dataC.sort(key=lambda x: x[1], reverse=True)

dataG = {k:np.average([np.average(list(x.grades.values())) for x in v]) for (k,v) in dataG.items()}.items()
dataG = list(dataG)
dataG.sort(key=lambda x: x[1], reverse=True)

print(dataC)
print(dataG)