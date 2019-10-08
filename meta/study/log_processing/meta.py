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

def prefixMap(logs, prefix, func = lambda x: x):
    return list(map(func, filter(lambda x: x[0] == prefix, logs)))

def nJoin(l):
    return '\n'.join(l)

userTime = userTime(logs, 60)
print(f'User time: {userTime}s, {userTime//60}m, {userTime//(60*60)}h')
# print(nJoin(prefixMap(logs, 'CONFIRM', lambda x: ' ||| '.join(x[3:5]))))

def confirmSplit(logs):
    segments = []
    curSegment = []
    for log in logs:
        if log[0] == 'CONFIRM':
            segments.append(curSegment)
            curSegment = []
        else:
            curSegment.append(log)
    return segments

def withoutBacktracking(logs):
    segments = confirmSplit(logs)
    out = []
    for segment in segments:
        translates = prefixMap(segment, 'TRANSLATE1', lambda x: x[2])
        prev = ''
        ok = True
        for line in translates:
            if line.startswith(prev):
                prev = line
            else:
                ok = False
                break
        if ok:
            out.append([line, len(segment)])
    print('Number of all segments:', len(segments))
    print('Number of segments without backtracking:', len(out))

withoutBacktracking(logs)

def averageTime(logs, maxduration=500):
    segments = confirmSplit(logs)
    out = [int(s[-1][1]) - int(s[0][1]) for s in segments]
    out = list(filter(lambda x: x < maxduration, out))
    print(f'Average time per task: {sum(out)/len(out):.0f}s')

averageTime(logs)