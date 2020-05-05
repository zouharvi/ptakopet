#!/usr/bin/env python3

import argparse
import csv
import json

parser = argparse.ArgumentParser(description='Create list of stimuli message rules')
parser.add_argument('tsvfile', help='path to the tsvfile containing messages')
args, _ = parser.parse_known_args()

out = []
with open(args.tsvfile) as tsvfile:
    reader = csv.reader(tsvfile, delimiter='\t')
    for row in reader:
        out.append({
            'rule': '^' + row[0].rstrip('.png') + '.*',
            'message': f'Translate the highlighted text in the online form to Czech.<br>Try to achieve the best possible translation quality.<div style="margin-top: 15px; font-size: 15pt; font-weight: bold;">{row[1]}</div>',
        })

if __name__ == '__main__':
    print(json.dumps(out))
