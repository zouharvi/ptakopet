#!/usr/bin/env python3
import argparse
import pickle
from collections import Counter
import matplotlib.pyplot as plt
from utils import isWithoutBacktracking

# Process quality annotations on collected data (mostly graphs)

COLOR_FV = 'greenyellow'
COLOR_FN = 'olivedrab'

parser = argparse.ArgumentParser(description='')
parser.add_argument('blogfile',  help='Path to the binary log (.blog) file in question')
parser.add_argument('-f', '--fix_usid', help='Fix USID mapping and save it to a0csv', action='store_true')
args = parser.parse_args()

with open(args.blogfile, 'rb') as f:
    segments = pickle.load(f)

tFVdom = dict()
tFNdom = dict()
tPairs = []
# histogram by domain
for seg in segments:
    rating = seg['rating']
    if 'first_viable' in rating and 'final' in rating:
        # temporary until all data is processed
        if rating['first_viable'] == 0 or rating['final'] == 0 or isWithoutBacktracking(seg):
            continue
        tFVdom.setdefault(seg['domain'], []).append(rating['first_viable'])
        tFVdom.setdefault('*', []).append(rating['first_viable'])
        tFNdom.setdefault(seg['domain'], []).append(rating['final'])
        tFNdom.setdefault('*', []).append(rating['final'])
        tPairs.append((rating['final'], rating['first_viable']))

# tFVdom = {k:sum(v)/len(v) for k,v in tFVdom.items()}
# tFNdom = {k:sum(v)/len(v) for k,v in tFNdom.items()}
print('First viable')
for domain, arr in tFVdom.items():
    avg = sum(arr)/len(arr)
    var = sum([(x-avg)**2 for x in arr])/len(arr)
    print(f'Domain: {domain}, average: {avg:.2f}, variance: {var:.2f}') 

print('\nFinal')
for domain, arr in tFNdom.items():
    avg = sum(arr)/len(arr)
    var = sum([(x-avg)**2 for x in arr])/len(arr)
    print(f'Domain: {domain}, average: {avg:.2f}, variance: {var:.2f}') 

tFV = []
tFN = []
for seg in segments:
    rating = seg['rating']
    if 'first_viable' in rating and 'final' in rating:
        # temporary until all data is processed
        if rating['first_viable'] == 0 or rating['final'] == 0 or isWithoutBacktracking(seg):
            continue
        tFV.append(rating['first_viable'])
        tFN.append(rating['final'])
tFVavg = sum(tFV)/len(tFV)
tFNavg = sum(tFN)/len(tFN)
print(f'First viable: {tFVavg:.2f}, Final: {tFNavg:.2f}, Total: {len(tFV)}')

tFVc = Counter(tFV)
tFNc = Counter(tFN)

# histogram for final vs first viable ratings
plt.bar([x - 0.25/2 for x in tFVc.keys()], tFVc.values(), color=COLOR_FV, width=0.25, label='First viable')
plt.bar([x + 0.25/2 for x in tFNc.keys()], tFNc.values(), color=COLOR_FN, width=0.25, label='Final')
plt.xlabel('Rating')
plt.ylabel('Number of segments')
plt.legend()
plt.show()

# Histogram of average rating by sentence length
SIZES = [5, 10, 15, 20, 25, 30, 50]
tFNbuckets = [[] for _ in (SIZES)]
tFVbuckets = [[] for _ in (SIZES)]
for seg in segments:
    if seg['final'] is not None and seg['first_viable_trg'] is not None:
        txt = seg['final']['text1']
        if txt is None or (not 'final' in seg['rating']) or seg['rating']['final'] == 0:
            continue
        for sizeI in range(len(SIZES)):
            if len(txt.split(' ')) <= SIZES[sizeI]:
                break 
        if sizeI == 8:
            print(sizeI, len(txt.split(' ')), txt)
        tFNbuckets[sizeI].append(seg['rating']['final'])

        txt = seg['first_viable_trg']['text1']
        if txt is None or (not 'first_viable' in seg['rating']) or seg['rating']['first_viable'] == 0:
            continue
        for sizeI in range(len(SIZES)):
            if len(txt.split(' ')) <= SIZES[sizeI]:
                break 
        tFVbuckets[sizeI].append(seg['rating']['first_viable'])

tFNbuckets = [sum(ar)/len(ar) if len(ar) != 0 else 0 for ar in tFNbuckets]
tFVbuckets = [sum(ar)/len(ar) if len(ar) != 0 else 1 for ar in tFVbuckets]
xticks = range(len(SIZES))
plt.clf()
plt.bar([s - 0.35/2 for s in xticks], tFVbuckets, color=COLOR_FV, width=0.35, label='First viable')
plt.bar([s + 0.35/2 for s in xticks], tFNbuckets, color=COLOR_FN, width=0.35, label='Final')
XTICKSLABELS = ['≤5', '6-10', '11-15', '16-20', '21-25', '26-30', '≥31']
plt.xticks(ticks=xticks, labels=XTICKSLABELS)
plt.ylim(1, 5)
plt.xlabel('Length of input in words')
plt.ylabel('Average rating in the bucket')
plt.legend()
plt.show()

# paired t-test from tPairs
import math
from scipy import stats
DIFF = 0
diffs = [x[0] + DIFF - x[1] for x in tPairs]
avg = sum(diffs)/len(diffs)
var = sum((d - avg)**2 for d in diffs)/(len(diffs) - 1) # * 2
sd = math.sqrt(var)
T = avg/(sd/math.sqrt(len(diffs)))
pval = stats.t.sf(abs(T), len(diffs)-1)
print(pval) # 9.316163371064496e-65

# for x in tPairs:
#     print(x[0])
# print('--')
# for x in tPairs:
#     print(x[1])
# print('--')