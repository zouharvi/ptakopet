#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import re
from collections import Counter

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('-o', '--out-sentences', help='Path to a file to which to output all viable sentences, including confirmed', default=None)
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

valid_data = [x for x in data if not x.invalid]

def viable(text):
    return re.match(r"^.*[\.\?]\s*$", text) and len(text) >= 10

def viable_src(src, tgt):
    rat = len(src)/len(tgt)
    return rat <= 1.3 and rat >= 0.7

def viable_basic(text):
    return len(text) >= 15

def standardize(text):
    return text.replace('&#44;', ',').replace('<br>', '\\n').strip()

length_ratios = []
a_viables = set()
count_confirm = 0
count_viables = 0

for segment in valid_data:
    s_viables = []
    for line in segment.data:
        if line[0] == 'CONFIRM_OK':
            confirm_tgt_sent = standardize(line[4])
            confirm_src_sent = standardize(line[3])
            confirm_viable = viable(confirm_src_sent)
            if not confirm_viable:
                confirm_src_last = confirm_src_sent.split(' ')[-1]

    if (not viable_basic(confirm_src_sent)) or (not viable_basic(confirm_tgt_sent)):
        continue
    else:
        count_confirm += 1
        a_viables.add((segment.sid, confirm_tgt_sent))


    for line in segment.data:
        if line[0] == 'TRANSLATE1':
            standardized_tgt = standardize(line[3])
            standardized_src = standardize(line[2])
            if standardized_src != confirm_src_sent:
                if viable_src(standardized_src, confirm_src_sent) and \
                    (
                        viable(standardized_src) or 
                        (not confirm_viable and standardized_src.split(' ')[-1] == confirm_src_last and viable_basic(standardized_src))
                    ):
                    s_viables.append(standardized_tgt)
                    a_viables.add((segment.sid, standardized_tgt))
                    count_viables += 1
                    print('V', standardized_tgt)
                else:
                    print(' ', standardized_tgt)

    print('C', confirm_tgt_sent)
    print('-'*10)
    s_viables = set(s_viables)
    if len(s_viables) != 0:
        length_ratios += [len(x)/len(confirm_tgt_sent) for x in s_viables]

print('Unique viables', len(a_viables))
print('Segments', len(valid_data))
print('Ratio', count_viables/count_confirm)
print('Avg length ratios', sum(length_ratios)/len(length_ratios))

if args.out_sentences:
    with open(args.out_sentences, 'w') as f:
        f.writelines('\n'.join([f'{x[0]}\t{x[1]}' for x in a_viables]))