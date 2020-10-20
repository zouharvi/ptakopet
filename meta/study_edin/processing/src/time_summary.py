#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import numpy as np
from utils import CONFIG_ORDER

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [x for x in data if not x.invalid]

config_time = {}
lang_time = {}
total_time = []
config_events = {}
lang_events = {}
total_events = []

def segment_time(segment):
    times = [int(x[1]) for x in segment.data]
    return (max(times)-min(times))/(10**3)

def segment_events(segment):
    return sum([1 for x in segment.data if x[0] in {'TRANSLATE1', 'TRANSLATE2'}])/2

def average_sane(data, limitL=0, limitR=60*10):
    l = [x for x in data if x <= limitR and x >= limitL]
    return np.average(l)

for segment in data:
    s_time = segment_time(segment)
    config_time.setdefault(segment.cid.nicename_nomt_noft(), []).append(s_time)
    lang_time.setdefault(segment.cid.engine,[]).append(s_time)
    total_time.append(s_time)


    s_events = segment_events(segment)
    config_events.setdefault(segment.cid.nicename_nomt_noft(), []).append(s_events)
    lang_events.setdefault(segment.cid.engine,[]).append(s_events)
    total_events.append(s_events)

print(('\n'+'%'*10)*4)

print(f'Czech MT 1 & {average_sane(lang_time["csw"]):.0f} & {average_sane(lang_events["csw"], limitL=1, limitR=1000):.2f}  \\\\') 
print(f'Czech MT 2 & {average_sane(lang_time["cs"]):.0f}  & {average_sane(lang_events["cs"],  limitL=1, limitR=1000):.2f}  \\\\') 
print(f'Czech MT 3 & {average_sane(lang_time["css"]):.0f} & {average_sane(lang_events["css"], limitL=1, limitR=1000):.2f}  \\\\') 
print(f'Estonian   & {average_sane(lang_time["et"]):.0f}  & {average_sane(lang_events["et"],  limitL=1, limitR=1000):.2f}  \\\\ \hline') 

for order in CONFIG_ORDER:
    cid = CID(order)
    time = average_sane(config_time[cid.nicename_nomt_noft()])
    events = average_sane(config_events[cid.nicename_nomt_noft()], limitL=1, limitR=1000)
    print(f'{cid.nicename_nomt_noft()} & {time:.0f} & {events:.2f} \\\\')

print('\\hline')

print(f'Total & {average_sane(total_time):.0f} & {average_sane(total_events, limitL=1, limitR=1000):.2f} \\\\')

print(('\n'+'%'*10)*4)