#!/usr/bin/env python3
import os, argparse, pickle

# This script does some basic time metrics and then cleans the data and
# dumps them into a pickle file by segments. Each line is prefixed by the
# author and also time in each segment is changed to be relative to the
# segment's beginning.
# 
# Input must be Ptakopět log files each of single person (more precisely
# the file must be sorted by time tags).

parser = argparse.ArgumentParser(description='')
parser.add_argument('logfile', nargs='+',
                    help='Path to the log file in question')
parser.add_argument('-j', '--join',
                    help='Clean and join to one output file')
args = parser.parse_args()

def userTime(logs, maxrest=60):
    timestamps = [int(x[1]) for x in logs]
    # assuming it's not empty
    last = timestamps.pop(0)
    total = 0
    for x in timestamps:
        if x - last <= maxrest:
            total += x - last
        last = x
    print(f'User time: {total}s, {total/60:.1f}m, {total/(60*60):.1f}h')
    return total

def prefixMap(logs, prefix, func=lambda x: x):
    return list(map(func, filter(lambda x: x[0] == prefix, logs)))

def nJoin(l):
    return '\n'.join(l)

def averageTime(logs, maxduration=500):
    segments = confirmSplit(logs)
    segments = filter(lambda x: len(x) > 1, segments)
    out = [int(s[-1][1]) - int(s[0][1]) for s in segments]
    out = list(filter(lambda x: x < maxduration, out))
    time = sum(out)/len(out)
    print(f'Average time per task: {time:.0f}s')
    return time

def confirmSplit(logs):
    segments = []
    curSegment = []
    for log in logs:
        curSegment.append(log)
        if log[0] == 'CONFIRM':
            segments.append(curSegment)
            curSegment = []
    return segments

def cleanSegments(segments):
    for s in segments:
        base = int(s[0][1])
        for line in s:
            line[1] = int(line[1]) - base
    return segments

allSegments = []
# Process every file
for logfile in args.logfile:
    name = os.path.basename(logfile).rstrip('.log')
    print(logfile)
    with open(logfile, 'r') as f:
        logs = [x.rstrip('\n').split(',') for x in f.readlines()]
        logs = [[x.replace('&#44;', ',') for x in line] for line in logs]

    print(f'Processing {name}:')
    userTime(logs)
    averageTime(logs)
    if args.join is not None:
        segments = confirmSplit(logs)
        segments = cleanSegments(segments)
        segments = [[[name]+line for line in s] for s in segments]
        allSegments += segments
    print()

if args.join is not None:
    with open(args.join, 'wb') as f:
        pickle.dump(allSegments, f)
