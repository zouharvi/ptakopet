#!/usr/bin/env python3

# Create baked queues for users from the pool of all questions
# s - SQuAD 2.0
# z - SQuAD 2.0 - Czech
# t - Technical issues
# p - Administrative issues

# This script does not require any data input, as the number of questions
# in each pool is hardcoded. Simply use the arguments described in
# ArgumentParser or pass --help as an argument.

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

# Total users
tusers = args.cusers + args.busers
# Czech-only users
cusers = args.cusers
# Bilingual (Czech, English) users
busers = args.busers
# Hardcoded sizes of question pools
segments = {'z': 60, 's': 60, 't': 35, 'p': 30, } 

segUsr = []
segQID = {'z': [], 's': [], 't': [], 'p': [], }

# Lineary fill seqQID arrays
for key in ['t', 'p', 'z', 's']:
    for t in range(segments[key]):
        qID = f'{key}{t:02}'
        segQID[key].append(qID)

random.seed(args.seed)

# Shuffle t, p
for u in range(tusers):
    tmp = list(segQID['t'] + segQID['p'])
    random.Random(tusers*args.seed+u).shuffle(tmp)
    segUsr.append(tmp)
    
# Shuffle z for czech-only
for u in range(cusers):
    tmp = list(segQID['z'])
    random.Random(tusers*args.seed+u).shuffle(tmp)
    segUsr[u] += tmp

# Shuffle z, s for bilinguals
for u in range(busers):
    tmp = list(zip(segQID['z'], segQID['s']))
    random.Random(tusers*args.seed+u).shuffle(tmp)
    segUsr[cusers+u] += [random.choice(x) for x in tmp]

# Shuffle each user
for u in range(tusers):
    random.Random(tusers*args.seed+u).shuffle(segUsr[u])
    if args.per_user is not None:
        segUsr[u] = segUsr[u][:args.per_user]

# Return the number of occurences per user in each domain 
count = lambda prefix, u: len(list(filter(lambda x: x.startswith(prefix), segUsr[u])))

# Distribution statistics
print('s: SQuAD, z: Zilinec, t: Tech issues, p: Praha 6')
print("     s  z  t  p")
for u in range(tusers):
    stats = [f'{count(x, u):02}' for x in ["s", "z", "t", "p"]]
    print(f'u{u}: {" ".join(stats)}')

print("\nIntersections (in %)")
print("     " + "  ".join([f'u{u}' for u,_ in enumerate(segUsr)])) 
def intersection(lst1, lst2): 
    return list(set(lst1) & set(lst2)) 
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
    
# Write to file
with open(args.file, 'w') as f:
    outUsr = {f'u{k}':v for k,v in enumerate(segUsr) }
    f.write(json.dumps(outUsr, ensure_ascii=False))
