#!/usr/bin/env python3

# Create baked queues for users from the pool of all questions
# 1 - read all stimuli
# 2 - generate all version of a stimuli
# 3 - assign these stimuli to users
# 4 - sort (if applicable)
# 5 - output baked file


import argparse
import json
import random
from read_stimuli import stimuliList
from itertools import product

parser = argparse.ArgumentParser(description='Distribute questions')
parser.add_argument('--seed', help='randomizer seed', type=int, default=0)
parser.add_argument('--users', help='number of users', type=int, default=4)
parser.add_argument('--file', help='output baked file', default='baked.json')
args, _ = parser.parse_known_args()

configs = [
    'bt.n-pp.n-qe.n-cs',
    'bt.y-pp.n-qe.n-cs',
    'bt.n-pp.y-qe.n-cs',
    'bt.y-pp.y-qe.n-cs',
    'bt.n-pp.n-qe.n-et',
    'bt.y-pp.n-qe.n-et',
    'bt.n-pp.y-qe.n-et',
    'bt.y-pp.y-qe.n-et',
]

print("Stimuli:", stimuliList)
# stimuliAll = list(map(lambda x: x[0] + '#' + x[1], product(stimuliList, configs)))
stimuliAll = list(product(stimuliList, configs))

if args.users < len(configs):
    print("Impossible to create a fair queue")
    exit(0)

random.seed(args.seed)

queue = [[] for _ in range(args.users)]
for i in range(len(stimuliAll)):
    user = i % args.users
    pcounter = 0
    while True:
        stim = random.choice(stimuliAll)
        ok = True
        for stimU in queue[user]:
            if stimU[0] == stim[0]:
                ok = False
                break
        if ok:
            stimuliAll.remove(stim)
            queue[user].append(stim)
            break
        pcounter += 1
        # 50 attempts
        user = (i+(pcounter // 50)) % args.users

queue = [[x[0] + '#' + x[1] for x in user] for user in queue]

# sort each user
queue = [sorted(userQueue, key=lambda x: 'et' in x) for userQueue in queue]
queueU = {}
for u in range(len(queue)):
    queueU['u' + str(u).zfill(3)] = {'bakedQueue': queue[u]}

if args.file:
    with open(args.file, 'w') as f:
        print(json.dumps(queueU), file=f)
