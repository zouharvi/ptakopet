#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import numpy as np
import csv


parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('csv', help='Path to a csv file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success, data))

with open(args.csv, 'w') as csvfile:
    writer = csv.writer(csvfile, delimiter='\t', quoting=csv.QUOTE_ALL)
    for segment in data:
        if segment.cid.engine == 'et':
            continue

        confirm = None
        for line in segment.data:
            if line[0] == 'CONFIRM_OK':
                confirm = line
                break
        if len(confirm[3]) == 0:
            continue
        writer.writerow([segment.sid, segment.uid, line[3].replace('&#44;', ','), line[4].replace('&#44;', ','), 0])
