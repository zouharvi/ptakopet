#!/bin/env python3
import argparse, sys
import subprocess

"""
This file is deprecated as parallel text files are created ad hoc.
This saves lots of space and the performance hit is not that critical.
"""

FAST_ALIGN = '../../align/fast_align/build/fast_align'

def formatParallel(fileSource, fileTarget, fileOut):
    with open(fileSource, 'r') as fileSource:
        with open(fileTarget, 'r') as fileTarget:
            with open(fileOut, 'w') as fileOut:
                lines1 = [x.rstrip('\n') for x in fileSource.readlines()]
                lines2 = [x.rstrip('\n') for x in fileTarget.readlines()]
                out = ["{} ||| {}".format(x, y) for (x, y) in zip(lines1, lines2)]
                print('\n'.join(out), file=fileOut)

def fast_align(fileCorpus, fileOut):
    bashCommand = "{} -d -o -v -i {}".format(FAST_ALIGN, fileOut)
    process = subprocess.Popen(
        bashCommand.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, _ = process.communicate()
    with open(fileOut, 'w') as fileOut:
        print(output.decode('utf-8').rstrip('\n'), file=fileOut)

if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument('-a', '--all', help='Process all files in the ./ folder', action="store_true")
    parser.add_argument('-f1', '--file1', help='Process file1 located in ./')
    parser.add_argument('-f2', '--file2', help='Process file2 located in ./')
    parser.add_argument('-o', '--out', help='Output to ./out.align')
    args=parser.parse_args()
    
    if args.all:
        raise "Not implemented (yet)"
    elif args.file1 and args.file2 and args.out:
        formatParallel(args.file1, args.file2, args.out)
    else:
        print("Not enough parameters, see help.")