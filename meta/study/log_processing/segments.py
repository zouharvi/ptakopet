#!/usr/bin/env python3
import argparse
import pickle

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('blogfile',  help='Path to the binary log (.blog) file in question')
parser.add_argument('-sr1', '--segments_r1',
                    help='Path to file for segments readable 1 output')
parser.add_argument('-sr2', '--segments_r2',
                    help='Path to file for segments readable 2 output')
args = parser.parse_args()


def prefixMap(logs, prefix, func=lambda x: x):
    return list(map(func, filter(lambda x: x[1] == prefix, logs)))


def withoutBacktracking(segments):
    out = []
    for segment in segments:
        translates = prefixMap(segment, 'TRANSLATE1', lambda x: x[3])
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

def flatten(l):
    return [item for sublist in l for item in sublist]

def segmentR1(segment):
    out = ''
    l1, l2, l3 = '-', '-', '-'
    for line in segment:
        write = False
        if line[1] == 'TRANSLATE1':
            l1 = line[3] # source
            l2 = line[4] # target
            write = True
        if line[1] == 'TRANSLATE2':
            l3 = line[4] # back
            # write = True
        if write:
            out += f'{l1}\n{l2}\n{l3}\n--\n'
    return out + '\n###\n'

def segmentR2(segment):
    out = ''
    for line in segment:
        if line[1] == 'TRANSLATE1':
            out += f'{line[3]}\n'
    return out + '\n###\n'

def outputSegmentsR(segments, func, outfile):
    out = [func(s) for s in segments]
    with open(outfile, 'w') as f:
        f.write('\n'.join(out))

with open(args.blogfile, 'rb') as f:
    segments = pickle.load(f)

withoutBacktracking(segments)
if args.segments_r1 is not None:
    outputSegmentsR(segments, segmentR1, args.segments_r1)
if args.segments_r2 is not None:
    outputSegmentsR(segments, segmentR2, args.segments_r2)