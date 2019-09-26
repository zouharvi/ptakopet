#!/usr/bin/env python3

import argparse

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('logfile', help='Path to the log file in question')
args = parser.parse_args()

with open(args.logfile, 'r') as f:
    logs = [x.rstrip('\n').split(',') for x in f.readlines()]
    logs = [[x.replace('&#44;', ',') for x in line] for line in logs]

def userTime(logs, maxrest=60):
    timestamps = [int(x[1]) for x in logs]
    # assuming it's not empty
    last = timestamps.pop(0)
    total = 0
    for x in timestamps:
        if x - last <= maxrest:
            total += x - last
        last = x
    return total

def prefixMap(logs, prefix, func):
    return list(map(func, filter(lambda x: x[0] == prefix, logs)))

def nJoin(l):
    return '\n'.join(l)

userTime = userTime(logs, 60)
print(f'User time: {userTime}s, {userTime//60}m, {userTime//(60*60)}h')
print(nJoin(prefixMap(logs, 'CONFIRM', lambda x: ' ||| '.join(x[3:5]))))
