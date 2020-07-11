#!/usr/bin/env python3

import sys, os, glob
import argparse
import pickle
import csv
from load import Segment, CID
import re

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load log objects.')
    parser.add_argument('blog3_in', help='Path to a blog3 file')
    parser.add_argument('blog3_out', help='Path to a blog3 file')
    parser.add_argument('csv', help='Path to a csv file')
    parser.add_argument('--name', default='unnamed', help='Annotator ID')
    args = parser.parse_args()

    with open(args.blog3_in, 'rb') as f:
        data = pickle.load(f)
    
    with open(args.csv, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quoting=csv.QUOTE_ALL)
        for line in reader:
            sid = int(line[0])
            uid = line[1]
            grade = int(line[4])

            if grade == 0:
                print('Invalid grade')

            # This is absolutely inefficient
            for i, segment in enumerate(data):
                if segment.sid == sid and segment.uid == uid:
                    segment.grades[args.name] = grade
                    break

    with open(args.blog3_out, 'wb') as f:
        pickle.dump(data, f)