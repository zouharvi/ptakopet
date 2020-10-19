#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import re
from numpy import average
from collections import Counter
from utils import CONFIG_ORDER

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [x for x in data if not x.invalid]

config_time = {}
lang_count = {}

def segment_time(segment):
    return 5

for segment in data:
    config_time.setdefault(segment.cid.nicename_nomt_noft(), []).append(segment_time(segment))
    lang_count.setdefault(segment.cid.engine,[]).append(segment_time(segment))

print(('\n'+'%'*10)*4)

print(f'Czech MT 1 & {average(lang_count["csw"])} \\\\') 
print(f'Czech MT 2 & {average(lang_count["cs"])} \\\\') 
print(f'Czech MT 3 & {average(lang_count["css"])} \\\\') 
print(f'Estonian & {average(lang_count["et"])} \\\\ \hline') 

for order in CONFIG_ORDER:
    # for configuration in config_count.keys():
    #     if re.match(f'ft\.y-{order}-\w+', configuration):
    #         total_succ += config_count[configuration]
    #     if re.match(f'ft\.y-{order}-\w+_skip', configuration):
    #         total_skip += config_count[configuration]
    # find some passing CID:
    for d in data:
        if re.match('.*' + order + '.*', d.cid.__str__()):
            print(f'{d.cid.nicename_nomt_noft()} & {average(config_time[d.cid.nicename_nomt_noft()])} \\\\')
            break

print('\\hline')

print(f'Total & {abs_total_succ} & {abs_total_skip} \\\\')

print(('\n'+'%'*10)*4)