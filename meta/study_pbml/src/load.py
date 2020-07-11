#!/usr/bin/env python3

import sys, os, glob
import argparse
import pickle
import re

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load log objects.')
    parser.add_argument('directory', help='Path to a directory from where to get all .log files')
    parser.add_argument('-b3', '--blog3', help='Path to a blog3 file')
    args = parser.parse_args()

# Configuration ID
class CID:
    def __init__(self, data):
        self.raw = data
        self.ft = bool(re.match(r'.*ft\.y.*', data))
        self.bt = bool(re.match(r'.*bt\.y.*', data))
        self.pp = bool(re.match(r'.*pp\.y.*', data))
        self.qe = bool(re.match(r'.*qe\.y.*', data))
        self.engine = re.search(r'.*-(.*?)$', data).group(1)

    def __str__(self):
        return self.raw

class Segment:
    def __init__(self, data, uid, block):
        self.data = data
        self.uid = uid
        self.block = block
        self.grades = {}
        for line in data:
            if line[0] == 'CONFIRM_OK':
                self.success = True
                self.score = int(line[6])
            if line[0] == 'CONFIRM_SKIP':
                self.success = False
                self.skip_reason = line[3]

            if line[0].startswith('CONFIRM'):
                self.sid = int(line[2].split('#')[0])
                self.cid = CID(line[2].split('#')[1])
                break

        if self.cid.qe:
            ok = False
            for line in data:
                if line[0] == 'ESTIMATE':
                    ok = True
                    break
            if not ok:
                self.cid.qe = False
                self.cid.raw = self.cid.raw.replace('qe.y', 'qe.n')

def create_segments(data, uid, block):
    # TODO: sort by timestamp
    segments = []
    buffer = []
    for line in data:
        buffer.append(line)
        if line[0].startswith('CONFIRM'):
            segments.append(Segment(buffer, uid, block))
            buffer = []
    # if len(buffer) != 0:
    #     segments.append(Segment(buffer, uid, block))
    return segments

if __name__ == '__main__':
    data = []
    blocks = 0
    lines = 0
    segments = 0
    for filename in glob.glob(args.directory + '/*.log'): 
        base = os.path.splitext(os.path.basename(filename))[0]
        uid, block = base.split('-')
        with open(filename, 'r') as f:
            raw = [x.rstrip('\n').split(',') for x in f.readlines()]
            lines += len(raw)
            data += create_segments(raw, uid, block)
        blocks += 1

    segments = len(data)

    print(f'Lines:    {lines}')
    print(f'Blocks:   {blocks}')
    print(f'Segments: {segments}')

    if args.blog3:
        with open(args.blog3, 'wb') as f:
            pickle.dump(data, f)