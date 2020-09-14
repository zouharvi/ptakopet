#!/usr/bin/env python3

import sys, os, glob
import argparse
import pickle
import csv
import numpy as np

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load log objects.')
    parser.add_argument('csv1', help='Path to a csv file')
    parser.add_argument('csv2', help='Path to a csv file')
    parser.add_argument('csv3', help='Path to a csv file')
    args = parser.parse_args()

    d1 = []
    with open(args.csv1, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quoting=csv.QUOTE_ALL)
        for line in reader:
            d1.append(int(line[4]))
    d2 = []
    with open(args.csv2, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quoting=csv.QUOTE_ALL)
        for line in reader:
            d2.append(int(line[4]))
    d3 = []
    with open(args.csv3, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quoting=csv.QUOTE_ALL)
        for line in reader:
            d3.append(int(line[4]))
    c12 = np.corrcoef(d1, d2)[0][1]
    c13 = np.corrcoef(d1, d3)[0][1]
    c32 = np.corrcoef(d3, d2)[0][1]
    print((c12+c13+c32)/3)