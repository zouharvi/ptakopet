#!/usr/bin/env python3
import os, argparse, pickle, copy

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
parser.add_argument('-b', '--blog',
                    help='Clean and join to one output file')
args = parser.parse_args()

# Estimate total user time
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

# Filter actions, then perform func
def prefixMap(logs, prefix, func=lambda x: x):
    return list(map(func, filter(lambda x: x[0] == prefix, logs)))

def nJoin(l):
    return '\n'.join(l)

# Computes the average time per task
def averageTime(logs, maxduration=500):
    segments = confirmSplit(logs)
    segments = filter(lambda x: len(x) > 1, segments)
    out = [int(s[-1][1]) - int(s[0][1]) for s in segments]
    out = list(filter(lambda x: x < maxduration, out))
    time = sum(out)/len(out)
    print(f'Average time per task: {time:.0f}s')
    return time

# Split by CONFIRM actions
# An alternative would be to chunk by SIDs
def confirmSplit(logs):
    segments = []
    curSegment = []
    skipNext = False
    for i in range(len(logs)):
        if skipNext:
            skipNext = False
            continue
        log = logs[i]
        curSegment.append(log)
        # NEXT is relevant to both segments
        if log[0] == 'NEXT':
            # In case this get swapped
            if i < len(logs) -1 and logs[i+1][0] == 'CONFIRM':
                curSegment.pop()
                curSegment.append(logs[i+1])
                curSegment.append(log)
                segments.append(curSegment)
                curSegment = [log]
                skipNext = True
            else:
                segments.append(curSegment)
                curSegment = [copy.deepcopy(log)]
                
    return segments

# TODO: doc
def cleanSegments(segments):
    # Timestamps are recomputed to be with respect to segment start
    segments = list(filter(lambda seg: len(seg) > 1 and len(prefixMap(seg, 'START')) == 0, segments))
    segments = list(filter(lambda seg: len(prefixMap(seg, 'NEXT')) > 0, segments))
    for seg in segments:
        base = int(seg[0][1])
        for line in seg:
            line[1] = int(line[1])-base
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
    if args.blog is not None:
        segments = confirmSplit(logs)
        segments = cleanSegments(segments)
        segments = [[[name]+line for line in s] for s in segments]
        allSegments += segments
    print()

# Dump the segments object
if args.blog is not None:
    with open(args.blog, 'wb') as f:
        pickle.dump(allSegments, f)
