#!/usr/bin/env python3

import argparse
import json
import random

parser = argparse.ArgumentParser(description='Distribute questions')
parser.add_argument('--seed', help='randomizer seed', type=int, default=0)
parser.add_argument('--busers', help='number of bilingual users', type=int, default=4)
parser.add_argument('--cusers', help='number of czech-only users', type=int, default=2)
parser.add_argument('--per_user', help='max number of questions per user', type=int, default=None)
parser.add_argument('--file', help='output baked file', default='baked.json')
args = parser.parse_args()

tusers = args.cusers + args.busers # total users
cusers = args.cusers
busers = args.busers

segments = {'z': 60, 's': 60, 't': 35, 'p': 30, } 

segQID = {'z': [], 's': [], 't': [], 'p': [], }
segUsr = []

def generateQIDs(key):
    for t in range(segments[key]):
        qID = f'{key}{t:02}'
        segQID[key].append(qID)

generateQIDs('t')
generateQIDs('p')
generateQIDs('z')
generateQIDs('s')


random.seed(args.seed)

for u in range(tusers):
    tmp = list(segQID['t'] + segQID['p'])
    random.Random(tusers*args.seed+u).shuffle(tmp)
    segUsr.append(tmp)
    
for u in range(cusers):
    tmp = list(segQID['z'])
    random.Random(tusers*args.seed+u).shuffle(tmp)
    segUsr[u] += tmp

for u in range(busers):
    tmp = list(zip(segQID['z'], segQID['s']))
    random.Random(tusers*args.seed+u).shuffle(tmp)
    segUsr[cusers+u] += [random.choice(x) for x in tmp]

for u in range(tusers):
    random.Random(tusers*args.seed+u).shuffle(segUsr[u])
    if args.per_user is not None:
        segUsr[u] = segUsr[u][:args.per_user]

count = lambda prefix, u: len(list(filter(lambda x: x.startswith(prefix), segUsr[u])))

print('s: SQuAD, z: Zilinec, t: Tech issues, p: Praha 6')
print("     s  z  t  p")
for u in range(tusers):
    stats = [f'{count(x, u):02}' for x in ["s", "z", "t", "p"]]
    print(f'u{u}: {" ".join(stats)}')

def intersection(lst1, lst2): 
    return list(set(lst1) & set(lst2)) 
   
print("\nIntersections (in %)")
print("     " + "  ".join([f'u{u}' for u,_ in enumerate(segUsr)])) 
for u1 in range(tusers):
    print(f'u{u1} ', end='')
    for u2 in range(tusers):
        intSize = int(100*len(intersection(segUsr[u1], segUsr[u2]))/len(segUsr[0]))
        print(str(intSize).rjust(4), end='')
    print()

print('\nHistogram:')
# flatten
segFlat = [item for sublist in segUsr for item in sublist]
from collections import Counter
print(dict(Counter(Counter(segFlat).values())))
    
with open(args.file, 'w') as f:
    outUsr = {f'u{k}':v for k,v in enumerate(segUsr) }
    f.write(json.dumps(outUsr, ensure_ascii=False))
