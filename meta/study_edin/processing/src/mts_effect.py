#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import re
from collections import Counter
from utils import CONFIG_ORDER
import numpy as np

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [x for x in data if hasattr(x, 'score') and not x.invalid]

cnfg_count = {}
lang_count = {}

for segment in data:
    key = segment.cid.__str__()[5:19]
    cnfg_count.setdefault(key, []).append(segment.score)
    lang_count.setdefault(segment.cid.engine, []).append(segment.score)

cnfg_count = {k:np.average(v) for k,v in cnfg_count.items()}
lang_count = {k:np.average(v) for k,v in lang_count.items()}

print(('\n'+'%'*10)*4)

print(f'Czech 1 & {lang_count["csw"]:.2f} & {lang_count["csw"]:.2f} \\\\') 
print(f'Czech 2 & {lang_count["cs"]:.2f}  &  {lang_count["cs"]:.2f} \\\\') 
print(f'Czech 3 & {lang_count["css"]:.2f} & {lang_count["css"]:.2f} \\\\') 
print(f'Estonian &   {lang_count["et"]:.2f}  &  {lang_count["et"]:.2f} \\\\ \hline') 

for order in CONFIG_ORDER:
    print(f'{CID(order).nicename_nomt_noft()} & {cnfg_count[order]:.2f} & {0} \\\\')

print('\\hline')

print(f'Total & {0} & {0} \\\\')

print(('\n'+'%'*10)*4)