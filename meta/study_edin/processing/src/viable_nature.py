#!/usr/bin/env python3

import pickle
import argparse
from load import Segment, CID
from grades import QALog
import re
from collections import Counter
from utils import CONFIG_ORDER
from viable import standardize
import sys

#class QALogWithNature(QALog):
#    def __init__(self, data, line=None):
        

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Ptakopět log processing.')
    parser.add_argument('blog3', help='Path to a blog3 file')
    parser.add_argument('annot', help='Path to the viable nature annnotation file')
    parser.add_argument('blog3o', help='Path to an output blog3 file')
    args = parser.parse_args()

    with open(args.blog3, 'rb') as f:
        data = pickle.load(f)
    
    with open(args.annot, 'r') as f:
        annot_dict = {}
        for x in f.readlines():
            annot_list = x.rstrip('\n').split('\t', 2)
            if annot_list[2] in annot_dict:
                print("The nature of the viable already loaded: {:s} vs. {:s}. Skipping...".format(annot_dict[annot_list[2]], annot_list[0]))
            else:
                annot_dict[annot_list[2]] = annot_list[0]

    for i, x in enumerate(data):
        if not len(x.grade_f):
            continue
        grade_f_src = (x.grade_f[0]).src
        print(i, file=sys.stderr)
        for v in x.grade_v:
            if v.src != grade_f_src:
                key = "\t".join([v.src, grade_f_src])
                if key in annot_dict:
                    nature_val = annot_dict["\t".join([v.src, grade_f_src])]
                    v.nature = nature_val
                else:
                    print("Nature for the viable pair '{:s}' has not been annotated. Skipping...".format(key), file=sys.stderr)
    
    with open(args.blog3o, 'wb') as f:
        pickle.dump(data, f)
        
