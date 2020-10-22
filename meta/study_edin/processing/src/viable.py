#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import re
from collections import Counter
from random import shuffle

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('-o', '--out-sentences', help='Path to a file to which to output all viable sentences, including confirmed', default=None)
parser.add_argument('-l', '--lang', help='Language', default='cs')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

valid_data = [x for x in data if not x.invalid]
valid_data = [x for x in data if x.cid.lang == args.lang]

def viable(text):
    return re.match(r"^.*[\.\?]\s*$", text) and len(text) >= 10

def viable_src_to_confirm(src, tgt):
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
            confirm_tgt = standardize(line[4])
            confirm_src = standardize(line[3])
            confirm_viable = viable(confirm_src)
            if not confirm_viable:
                confirm_src_last = confirm_src.split(' ')[-1]

    if (not viable_basic(confirm_src)) or (not viable_basic(confirm_tgt)):
        continue
    else:
        count_confirm += 1
        a_viables.add((segment.sid, confirm_src, confirm_tgt))


    for line in segment.data:
        if line[0] == 'TRANSLATE1':
            viable_tgt = standardize(line[3])
            viable_src = standardize(line[2])
            if viable_src != confirm_src:
                if viable_src_to_confirm(viable_src, confirm_src) and \
                    (
                        viable(viable_src) or 
                        (not confirm_viable and viable_src.split(' ')[-1] == confirm_src_last and viable_basic(viable_src))
                    ):
                    s_viables.append(viable_tgt)
                    a_viables.add((segment.sid, viable_src, viable_tgt))
                    count_viables += 1
                    print('V', viable_tgt)
                else:
                    print(' ', viable_tgt)

    print('C', confirm_tgt)
    print('-'*10)
    s_viables = set(s_viables)
    if len(s_viables) != 0:
        length_ratios += [len(x)/len(confirm_tgt) for x in s_viables]

print('Unique viables', len(a_viables))
print('Segments', len(valid_data))
print('Ratio', count_viables/count_confirm)
print('Avg length ratios', sum(length_ratios)/len(length_ratios))

a_viables = list(a_viables)
shuffle(a_viables)

if args.out_sentences:
    with open(args.out_sentences, 'w') as f:
        f.writelines('\n'.join([f'{x[0]}\t{x[1]}\t{x[2]}' for x in a_viables]))