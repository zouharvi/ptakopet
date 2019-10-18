#!/usr/bin/env python3
import argparse

#
# Input must be Ptakopět log files each of single person (more precisely
# the file must be sorted by time tags)
#

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('logfile', nargs='+',
                    help='Path to the log file in question')
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
        if len(translates) == 0:
            continue
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
    return out

def averageTime(logs, maxduration=500):
    segments = confirmSplit(logs)
    segments = filter(lambda x: len(x) > 1, segments)
    out = [int(s[-1][1]) - int(s[0][1]) for s in segments]
    out = list(filter(lambda x: x < maxduration, out))
    time = sum(out)/len(out)
    print(f'Average time per task: {time:.0f}s')
    return time

# Process every file
for logfile in args.logfile:
    with open(logfile, 'r') as f:
        logs = [x.rstrip('\n').split(',') for x in f.readlines()]
        logs = [[x.replace('&#44;', ',') for x in line] for line in logs]

    print(f'Processing {logfile}:')
    userTime(logs, 60)
    averageTime(logs)
    # withoutBacktracking(logs)
    print()