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

# Values of the QALog.changetype attribute:
# the final viable contains a ??? the current viable, where ??? is
# P = paraphrase (rather lexical or combination of grammatical and lexical) of
# PG = grammatical paraphrase of
# PM = variant with shifted meaning of
# Q = quotation or other emphasis of a phrase from
# X = correction of the viable, which is obviously an intermediate version (e.g. contains typo, ungrammatical phrases, missing information)
# or any combination of the above


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Ptakopět log processing.')
    parser.add_argument('blog3', help='Path to a blog3 file')
    parser.add_argument('annot', help='Path to the file with change types for all unique viable--final pairs annotated')
    parser.add_argument('blog3o', help='Path to an output blog3 file')
    args = parser.parse_args()

    with open(args.blog3, 'rb') as f:
        data = pickle.load(f)
    
    with open(args.annot, 'r') as f:
        annot_dict = {}
        for x in f.readlines():
            annot_list = x.rstrip('\n').split('\t', 2)
            if annot_list[2] in annot_dict:
                print("The change type of the viable--final pair already loaded: {:s} vs. {:s}. Skipping...".format(annot_dict[annot_list[2]], annot_list[0]))
            else:
                annot_dict[annot_list[2]] = annot_list[0]

    for x in data:
        if not len(x.grade_f):
            continue
        grade_f_src = (x.grade_f[0]).src
        for v in x.grade_v:
            if v.src != grade_f_src:
                key = "\t".join([v.src, grade_f_src])
                if key in annot_dict:
                    changetype_val = annot_dict["\t".join([v.src, grade_f_src])]
                    v.changetype = changetype_val
                else:
                    print("Change type for the viable--final pair '{:s}' has not been annotated. Skipping...".format(key), file=sys.stderr)
    
    with open(args.blog3o, 'wb') as f:
        pickle.dump(data, f)
        
