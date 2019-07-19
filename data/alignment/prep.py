#!/bin/env python3
import argparse, sys
import subprocess

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
    parser.add_argument('-a', '--all', help='Process all files in the raw/ folder', action="store_true")
    parser.add_argument('-l1', '--lang1', help='Process base.lang1 located in raw/')
    parser.add_argument('-l2', '--lang2', help='Process base.lang2 located in raw/')
    parser.add_argument('-b', '--base', help='Output to raw/base.align')
    args=parser.parse_args()
    
    if args.all:
        raise "Not implemented (yet)"
    elif args.lang1 and args.lang2 and args.base:
        formatParallel('raw/{}.{}'.format(args.base, args.lang1), 'raw/{}.{}'.format(args.base, args.lang2), 'raw/{}.align'.format(args.base))
        fast_align('raw/{}.align'.format(args.base), 'raw/{}.align'.format(args.base))
    else:
        print("Not enough parameters, see help.")