#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog
from collections import Counter
from random import shuffle
from functools import reduce
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import MaxNLocator

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

data = [
    x for x in data if
    (len(x.grade_f) != 0) and
    (x.score is not None) and
    not x.invalid
]

for segment in data:
    avgGrade = np.round(np.average([float(x.overall)
                                    for x in segment.grade_f if x.overall is not None]))

    texts = [s[2] for s in segment.data if s[0] == 'TRANSLATE1']
    texts_len = [len(s[2]) for s in segment.data if s[0] == 'TRANSLATE1']
    avg_len = np.average(texts_len)

    if avg_len <= 30 and avgGrade <= 2:
        print(texts)