#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import re
from collections import Counter
from utils import CONFIG_ORDER
from viable import standardize

class QALog:
    def __init__(self, data, line=None):
        self.line = line
        self.data = data
        self.date = data[0]
        self.ip = data[1]
        self.hash = data[2]
        self.url = data[3]
        self.agent = data[4]
        self.user = data[5]
        self.queuen = int(data[6])
        self.sid = int(data[7])
        self.domain = data[8]
        self.src = data[9]
        self.tgt = data[10]
        self.src_sti_adq = int(data[11])
        self.tgt_src_adq = int(data[12])
        self.tgt_sti_adq = int(data[13])
        self.tgt_flu = int(data[14])
        self.overall = int(data[15])
        self.notes = data[16]

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Ptakopět log processing.')
    parser.add_argument('blog3', help='Path to a blog3 file')
    parser.add_argument('log', help='Path to Michal\'s tsv log file')
    parser.add_argument('blog3o', help='Path to an output blog3 file')
    args = parser.parse_args()

    with open(args.blog3, 'rb') as f:
        data = pickle.load(f)

    with open(args.log, 'r') as f:
        logs = [x.rstrip('\n').split('\t') for x in f.readlines()]

    for s in data:
        s.grade_v = []
        s.grade_f = []
        for (i, line) in enumerate(s.data):
            if line[0] == 'TRANSLATION1':
                src = standardize(line[2])
                tgt = standardize(line[3])
                for log in logs:
                    if int(log[7]) == s.sid and log[9] == src and log[10] == tgt:
                        s.grade_v.append(QALog(log, line=i))
            elif line[0] == 'CONFIRM_OK':
                src = standardize(line[3])
                tgt = standardize(line[4])
                for log in logs:
                    if int(log[7]) == s.sid and log[9] == src and log[10] == tgt:
                        s.grade_f.append(QALog(log))
                       
    with open(args.blog3o, 'wb') as f:
        pickle.dump(data, f)