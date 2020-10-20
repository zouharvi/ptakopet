#!/usr/bin/env python3

import sys
import os
import glob
import argparse
import pickle
import re

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load log objects.')
    parser.add_argument(
        'directory', help='Path to a directory from where to get all .log files')
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
        self.lang = ('cs' if bool(re.match(r'.*cs.*', data)) else 'et')

    def __str__(self):
        return self.raw

    def nicename_nomt_noft(self):
        out = ''
        if self.bt:
            out += 'BT '
        if self.qe:
            out += 'QE '
        if self.pp:
            out += 'PP '
        if out:
            return out.rstrip(' ')
        else:
            return '-'


class Segment:
    def __init__(self, data, uid, block):
        data = sorted(data, key=lambda x: int(x[1]))
        self.data = data
        self.uid = uid
        self.block = block
        self.grades = {}
        self.invalid = True
        self.delete = True

        for line in data:
            if line[0] == 'CONFIRM_OK':
                self.success = True
                self.score = int(line[6])
                if len(line[3]) != 0:
                    self.invalid = False

            if line[0] == 'CONFIRM_SKIP':
                self.success = False
                self.skip_reason = line[3]
                if len(line[3]) != 0:
                    self.invalid = False

            if line[0].startswith('CONFIRM'):
                self.sid = int(line[2].split('#')[0])
                self.cid = CID(line[2].split('#')[1])
                self.delete = False
                break


def create_segments(data, uid, block):
    segments = []
    buffer = []
    for line in data:
        buffer.append(line)
        if line[0].startswith('CONFIRM'):
            segments.append(Segment(buffer, uid, block))
            buffer = []
    if len(buffer) != 0:
        segments.append(Segment(buffer, uid, block))
    segments = [x for x in segments if not x.delete]
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

    print(f'Lines:       {lines}')
    print(f'Blocks:      {blocks}')
    print(f'Segments:    {segments}')
    print(f'OK Segments: {len([x for x in data if not x.invalid])}')

    if args.blog3:
        with open(args.blog3, 'wb') as f:
            pickle.dump(data, f)
