#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog
import numpy as np
from utils import CONFIG_ORDER

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [x for x in data if (not x.invalid) and (x.success) and len(x.grade_f) != 0]

config_time = {}
lang_time = {}
total_time = []
config_events = {}
lang_events = {}
total_events = []
config_timeperevent = {}
lang_timeperevent = {}
total_timeperevent = []

def segment_time(segment):
    times = [int(x[1]) for x in segment.data]
    return (max(times)-min(times))/(10**3)

def segment_events(segment):
    return sum([1 for x in segment.data if x[0] in {'TRANSLATE1', 'TRANSLATE2'}])/2

def average_sane(data, limitL=0, limitR=60*10, method=np.average):
    l = [x for x in data if x <= limitR and x >= limitL]
    return method(l)

def average_sane_timeperevent(timeperevents, events, limitL=0, limitR=60*10, method=np.median):
    tpee = zip(timeperevents, events)
    l = [tpe for tpe, e in tpee if e <= limitR and e >= limitL]
    return method(l)

for segment in data:
    s_time = segment_time(segment)
    config_time.setdefault(segment.cid.nicename_nomt_noft(), []).append(s_time)
    lang_time.setdefault(segment.cid.engine,[]).append(s_time)
    total_time.append(s_time)

    s_events = segment_events(segment)
    config_events.setdefault(segment.cid.nicename_nomt_noft(), []).append(s_events)
    lang_events.setdefault(segment.cid.engine,[]).append(s_events)
    total_events.append(s_events)
    
    s_timeperevent = s_time / s_events if s_events != 0 else None
    config_timeperevent.setdefault(segment.cid.nicename_nomt_noft(), []).append(s_timeperevent)
    lang_timeperevent.setdefault(segment.cid.engine,[]).append(s_timeperevent)
    total_timeperevent.append(s_timeperevent)

print(('\n'+'%'*10)*4)

#csw_zip = list(zip(lang_time["csw"], lang_events["csw"], lang_timeperevent["csw"]))
#print(csw_zip)

print(f'Czech 1 & {len(lang_time["csw"])} & {average_sane(lang_time["csw"], method=np.median):.0f} & {average_sane(lang_events["csw"], limitL=1, limitR=1000):.2f} & {average_sane_timeperevent(lang_timeperevent["csw"], lang_events["csw"], limitL=1, limitR=1000):.0f} \\\\') 
print(f'Czech 2 & {len(lang_time["cs"])} & {average_sane(lang_time["cs"], method=np.median):.0f}  & {average_sane(lang_events["cs"],  limitL=1, limitR=1000):.2f} & {average_sane_timeperevent(lang_timeperevent["cs"], lang_events["cs"], limitL=1, limitR=1000):.0f} \\\\') 
print(f'Czech 3 & {len(lang_time["css"])} & {average_sane(lang_time["css"], method=np.median):.0f} & {average_sane(lang_events["css"], limitL=1, limitR=1000):.2f} & {average_sane_timeperevent(lang_timeperevent["css"], lang_events["css"], limitL=1, limitR=1000):.0f} \\\\') 
print(f'Estonian  & {len(lang_time["et"])}  & {average_sane(lang_time["et"], method=np.median):.0f}  & {average_sane(lang_events["et"],  limitL=1, limitR=1000):.2f} & {average_sane_timeperevent(lang_timeperevent["et"], lang_events["et"], limitL=1, limitR=1000):.0f} \\\\ \\midrule') 

for order in CONFIG_ORDER:
    cid = CID(order)
    time = average_sane(config_time[cid.nicename_nomt_noft()], method=np.median)
    count = average_sane(config_time[cid.nicename_nomt_noft()], method=len)
    events = average_sane(config_events[cid.nicename_nomt_noft()], limitL=1, limitR=1000)
    timeperevent = average_sane_timeperevent(config_timeperevent[cid.nicename_nomt_noft()], config_events[cid.nicename_nomt_noft()], limitL=1, limitR=1000)
    print(f'{cid.nicename_nomt_noft()} & {count} & {time:.0f} & {events:.2f} & {timeperevent:.0f} \\\\')

print('\\midrule')

print(f'Total & {len(total_time)} & {average_sane(total_time, method=np.median):.0f} & {average_sane(total_events, limitL=1, limitR=1000):.2f} & {average_sane_timeperevent(total_timeperevent, total_events, limitL=1, limitR=1000):.0f} \\\\')

print(('\n'+'%'*10)*4)
