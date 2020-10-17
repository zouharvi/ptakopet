#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import re
from collections import Counter

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

valid_data = [x for x in data if not x.invalid]

def viable(text):
    return re.match(r"^.*[\.\?]\s*$", text)

count = 0
for segment in valid_data:
    out = []
    bad_confirm_ok = False
    for line in segment.data:
        if line[0] == 'CONFIRM_OK' and not viable(line[3]):
            bad_confirm_ok = True
            bad_confirm_ok_word = line[3].strip().split(' ')[-1]
            bad_confirm_ok_sent = line[3]
            # print(line[3])
            # print(bad_confirm_ok_word)
    if bad_confirm_ok:
        for line in segment.data:
            if line[0] == 'TRANSLATE1':
                if line[2].rstrip().split(' ')[-1] == bad_confirm_ok_word and line[2] != bad_confirm_ok_sent:
                    count += 1
                    print(line[2])
    # count += len(out)
    # print(out)

print(count)

# count = 0
# for segment in valid_data:
#     out = []
#     for line in segment.data:
#         if line[0] == 'TRANSLATE1' and viable(line[2]):
#             out.append(line[2])
#         if line[0] == 'CONFIRM_OK' and not viable(line[3]):
#             out.append(line[3])
#     count += len(out)
#     print(out)

# print(count)
