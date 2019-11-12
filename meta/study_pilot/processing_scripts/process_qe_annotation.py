#!/usr/bin/env python3
import argparse
import pickle
from collections import Counter
import matplotlib.pyplot as plt

# TODO

parser = argparse.ArgumentParser(description='')
parser.add_argument('blog2file',  help='Path to the binary log 2 (.blog2) file in question')
parser.add_argument('-f', '--fix_usid', help='Fix USID mapping and save it to a0csv', action='store_true')
args = parser.parse_args()

with open(args.blog2file, 'rb') as f:
    segments = pickle.load(f)

tFV = []
tFN = []
for seg in segments:
    rating = seg['rating']
    if 'first_viable' in rating and 'final' in rating:
        # temporary until all data is processed
        if rating['first_viable'] == 0 or rating['final'] == 0:
            continue
        tFV.append(rating['first_viable'])
        tFN.append(rating['final'])
tFVavg = sum(tFV)/len(tFV)
tFNavg = sum(tFN)/len(tFN)
print(f'First viable: {tFVavg:.2f}, Final: {tFNavg:.2f}, Total: {len(tFV)}')

tFVc = Counter(tFV)
tFNc = Counter(tFN)

# histogram for final vs first viable ratings
plt.bar(tFVc.keys(), tFVc.values(), color='r', width=0.25, label='first viable')
plt.bar([x + 0.25 for x in tFNc.keys()], tFNc.values(), color='b', width=0.25, label='final')
plt.xlabel('rating value')
plt.ylabel('number of segments')
plt.legend()
plt.show()

# TODO: histogram for final by sentence length