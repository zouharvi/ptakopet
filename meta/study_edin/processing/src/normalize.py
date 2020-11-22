#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
import re
from collections import Counter
from utils import CONFIG_ORDER
from viable import standardize
from grades import QALog
import numpy as np

SCORE_NAMES = ["src_sti_adq", "tgt_src_adq", "tgt_sti_adq", "tgt_flu", "overall"]

def standardize_grades(all_qalogs):
    all_users = set([ q.user for q in all_qalogs])
    for u in all_users:
        user_qalogs = [q for q in all_qalogs if q.user == u]
        user_scores = np.array([[getattr(q, s) for s in SCORE_NAMES] for q in user_qalogs], dtype=float)
        score_means = np.nanmean(user_scores, axis=0)
        score_std = np.nanstd(user_scores, axis=0)
        for q in user_qalogs:
            for i, s in enumerate(SCORE_NAMES):
                v = getattr(q, s) if getattr(q, s) is not None else np.nan
                new_v = (v - score_means[i]) / score_std[i]
                setattr(q, s, None if np.isnan(new_v) else new_v)

def standardize_confscores(data):
    all_users = set([x.uid for x in data])
    for u in all_users:
        user_data = [x for x in data if x.uid == u]
        user_scores = np.array([x.score for x in user_data], dtype=float)
        score_mean = np.nanmean(user_scores, axis=0)
        score_std = np.nanstd(user_scores, axis=0)
        for x in user_data:
            v = x.score if x.score is not None else np.nan
            new_v = (v - score_mean) / score_std
            x.score = None if np.isnan(new_v) else new_v
    
def standardize_grades_mm(all_qalogs):
    all_users = set([ q.user for q in all_qalogs])
    for u in all_users:
        user_qalogs = [q for q in all_qalogs if q.user == u]
        user_scores = np.array([[getattr(q, s) for s in SCORE_NAMES] for q in user_qalogs], dtype=float)
        score_min = np.min(user_scores, axis=0)
        score_max = np.max(user_scores, axis=0)
        for q in user_qalogs:
            for i, s in enumerate(SCORE_NAMES):
                v = getattr(q, s) if getattr(q, s) is not None else np.nan
                new_v = (v - score_min[i]) / (score_max[i] - score_min[i]) * 4 + 1
                setattr(q, s, None if np.isnan(new_v) else new_v)

def standardize_confscores_mm(data):
    all_users = set([x.uid for x in data])
    for u in all_users:
        user_data = [x for x in data if x.uid == u]
        user_scores = np.array([x.score for x in user_data], dtype=float)
        score_min = np.min(user_scores, axis=0)
        score_max = np.max(user_scores, axis=0)
        for x in user_data:
            v = x.score if x.score is not None else np.nan
            # new_v = (v - score_mean) / score_std
            new_v = (v - score_min) / (score_max - score_min) * 4 + 1
            x.score = None if np.isnan(new_v) else new_v
    

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('blog3o', help='Path to an output blog3 file', default=None)
parser.add_argument('--std', action='store_true', help='Use std', default=False)
args = parser.parse_args()

with open(args.blog3, 'rb') as f:
    data = pickle.load(f)


all_qalogs = []
for s in data:
    all_qalogs.extend(s.grade_v)
    all_qalogs.extend(s.grade_f)

if args.std:
    standardize_grades(all_qalogs)
    standardize_confscores(data)
else:
    standardize_grades_mm(all_qalogs)
    standardize_confscores_mm(data)

#print([x.score for x in data])

with open(args.blog3o, 'wb') as f:
    pickle.dump(data, f)
