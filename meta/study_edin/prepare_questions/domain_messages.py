#!/usr/bin/env python3

import argparse
import csv
import json


parser = argparse.ArgumentParser(description='Create list of stimuli')
parser.add_argument('tsvfile', help='path to the tsvfile containing messages')
args, _ = parser.parse_known_args()

out = dict()
with open(args.tsvfile) as tsvfile:
  reader = csv.reader(tsvfile, delimiter='\t')
  for row in reader:
      out['^' + row[0].rstrip('.png') + '.*'] = {'message': f'Translate the highlighted text in the online form to Czech.<br>Try to achieve the best possible translation quality.<br>({row[1]})'}

if __name__ == '__main__':
    print(json.dumps(out))