#!/usr/bin/env python3

import argparse
import os
import json

parser = argparse.ArgumentParser(description='Create list of stimuli')
parser.add_argument('stimuli_dir', help='path to the directory containing stimuli images')
args = parser.parse_args()

directory = os.fsencode(args.stimuli_dir)
stimuliList = []

for file in os.listdir(directory):
     filename = os.fsdecode(file)
     if filename.endswith('.png'):
         stimuliList.append(filename.rstrip('.png')) 

if __name__ == '__main__':
    print(json.dumps(stimuliList))