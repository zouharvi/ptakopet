#!/usr/bin/env python3
import argparse
import pickle

# This script is used only to load the blog file into interactive sessions

# run ./log_processing/load.py ./logs-backup-2/merged.blog 

parser = argparse.ArgumentParser(description='')
parser.add_argument('blogfile',  help='Path to the binary log (.blog) file in question')
args = parser.parse_args()

with open(args.blogfile, 'rb') as f:
    segments = pickle.load(f)
