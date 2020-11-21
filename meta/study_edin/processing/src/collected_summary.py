#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog
import re
from collections import Counter
from utils import CONFIG_ORDER

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

invalid_data = [x for x in data if x.invalid]
data = [x for x in data if not x.invalid]

config_count = {}
lang_count = {}
abs_total_succ = 0
abs_total_skip = 0

users = set()

for segment in data:
    if segment.success:
        users.add(segment.uid)
        config_count[f'{segment.cid}_succ'] = config_count.setdefault(f'{segment.cid}_succ', 0) + 1
        lang_count[f'{segment.cid.engine}_succ'] = lang_count.get(f'{segment.cid.engine}_succ', 0) + 1
        abs_total_succ += 1
    else:
        config_count[f'{segment.cid}_skip'] = config_count.setdefault(f'{segment.cid}_skip', 0) + 1
        lang_count[f'{segment.cid.engine}_skip'] = lang_count.get(f'{segment.cid.engine}_skip', 0) + 1
        abs_total_skip += 1

    # Total
    lang_count[f'{segment.cid.engine}'] = lang_count.get(f'{segment.cid.engine}', 0) + 1


print('Success user count', len(users))
print('Invalid data:', len(invalid_data))

print(('\n'+'%'*10)*4)

print(f'Czech 1 & {lang_count["csw_succ"]} & {lang_count["csw_skip"]} \\\\') 
print(f'Czech 2 & {lang_count["cs_succ"]} &  {lang_count["cs_skip"]} \\\\') 
print(f'Czech 3 & {lang_count["css_succ"]} & {lang_count["css_skip"]} \\\\') 
print(f'Estonian & {lang_count["et_succ"]} & {lang_count["et_skip"]} \\\\ \hline') 

for order in CONFIG_ORDER:
    total_succ = 0
    total_skip = 0
    for configuration in config_count.keys():
        if re.match(f'ft\.y-{order}-\w+_succ', configuration):
            total_succ += config_count[configuration]
        if re.match(f'ft\.y-{order}-\w+_skip', configuration):
            total_skip += config_count[configuration]
    print(f'{CID(order).nicename_nomt_noft()} & {total_succ} & {total_skip} \\\\')

print('\\hline')

print(f'Total & {abs_total_succ} & {abs_total_skip} \\\\')
data_annotated_succ = [x for x in data if (len(x.grade_f) != 0) and x.success]
data_annotated_skip = [x for x in data if (len(x.grade_f) != 0) and not x.success]
print(f'QA Annotated & {len(data_annotated_succ)} & {len(data_annotated_skip)} \\\\')


print(('\n'+'%'*10)*4)