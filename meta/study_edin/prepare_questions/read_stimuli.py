#!/usr/bin/env python3

import argparse
import os
import json
import csv

parser = argparse.ArgumentParser(description='Create list of stimuli')
parser.add_argument('tsvfile', help='path to the tsvfile containing messages')
args, _ = parser.parse_known_args()

stimuliList = []
with open(args.tsvfile) as tsvfile:
    reader = csv.reader(tsvfile, delimiter='\t')
    for row in reader:
        stimuliList.append(row[0].rstrip('.png'))

if __name__ == '__main__':
    print(json.dumps(stimuliList))
