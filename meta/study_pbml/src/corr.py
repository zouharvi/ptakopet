#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import numpy as np
from collections import Counter

parser = argparse.ArgumentParser(description='PBML log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = list(filter(lambda segment: segment.success and segment.grades != {}, data))

grades = {'avg': [], 'confidence': []}

for segment in data:
    batch = []
    for key, val in segment.grades.items():
        grades.setdefault(key, []).append(val)
        batch.append(val)
    grades['avg'].append(np.average(batch))
    grades['confidence'].append(segment.score)
    
# print('Native Czech correlation:', np.corrcoef(grades['zouhar'], grades['kalabova'], grades['kocova']))
print('Confidence-grade correlation:', np.corrcoef(grades['avg'], grades['confidence']))

# https://gist.github.com/awni/4ed15dfcfd000bcc4fb0f4e4ee30a6a0
def fleiss_kappa(ratings):
    """
    Args:
        ratings: An N x R numpy array. N is the number of
            samples and R is the number of reviewers. Each
            entry (n, r) is the category assigned to example
            n by reviewer r.
    Returns:
        Fleiss' kappa score.
    https://en.wikipedia.org/wiki/Fleiss%27_kappa
    """
    N, R = ratings.shape
    NR =  N * R
    categories = set(ratings.ravel().tolist())
    P_example = -np.full(N, R)
    p_class = 0.0
    for c in categories:
        c_sum = np.sum(ratings == c, axis=1)
        P_example += c_sum**2
        p_class += (np.sum(c_sum) / float(NR)) ** 2
    P_example = np.sum(P_example) / float(NR * (R-1))
    k = (P_example - p_class) / (1 - p_class)
    return k

kap = fleiss_kappa(np.array([grades['zouhar'], grades['kalabova'], grades['kocova']]).transpose())
print(kap)