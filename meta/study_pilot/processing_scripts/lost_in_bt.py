#!/usr/bin/env python3
import argparse
import pickle
from utils import prefixMap, tokenize
from difflib import SequenceMatcher

# Lost in Back-Translation export script

parser = argparse.ArgumentParser(description='')
parser.add_argument('blogin',  help='Path to input binary log (.blog) file')
parser.add_argument('csvout',  help='Path to output tsv file')
args = parser.parse_args()

with open(args.blogin, 'rb') as f:
    segments = pickle.load(f)

def isSimilar(src1, src2):
    sm = SequenceMatcher(None, tokenize(src1), tokenize(src2))
    return sm.ratio() > 0.8

out = []
for segment in segments:
    if segment['final']:
        text1 = segment['final']['text1']
        # out.append([text1])
    if segment['first_viable_src']:
        text1 = segment['first_viable_src']['text1']
        if text1[-1] in ['.', '?']:
            out.append([text1])

    if False and ('rating' in segment) and ('final' in segment['rating']):
        text1 = segment['final']['text1']
        text2 = segment['final']['text2']
        bts = prefixMap(segment, 'TRANSLATE2')
        for backObj in bts:
            if backObj['text2'] == text2:
                text3 = backObj['text3']
                if isSimilar(text1, text3):
                    out.append((segment['rating']['final'], text1, text2, text3))
                    break
        
# sort by score
out = sorted(out, key=lambda x: x[0], reverse=True)

with open(args.csvout, 'w') as f:
    for outObj in out:
        f.write('\t'.join([str(x) for x in outObj]) + '\n')